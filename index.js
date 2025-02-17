const xlsx = require("xlsx");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const getEmailBody = (name, title, company) => {
  if (!name || !title || !company) {
    throw new Error("Missing required parameters for email template");
  }

  const sanitize = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const sanitizedName = sanitize(name);
  const sanitizedTitle = sanitize(title);
  const sanitizedCompany = sanitize(company);

  // Format name for greeting (take first name only)
  const firstName = sanitizedName.split(" ")[0];

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Developer Opportunity</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p>Hi ${firstName},</p>

            <p>I noticed your role as ${sanitizedTitle} at ${sanitizedCompany} and wanted to reach out. I'm impressed by your background and believe you might be interested in some exciting developer opportunities we have available.</p>

            <p>Our team is working on cutting-edge projects using modern technologies, and we're looking for talented developers like yourself to join us. I'd love to schedule a brief chat to discuss:</p>

            <ul style="padding-left: 20px;">
                <li>Current remote and hybrid opportunities</li>
                <li>Competitive compensation packages</li>
                <li>Professional development resources</li>
                <li>Our collaborative team culture</li>
            </ul>

            <p>Would you be open to a 15-minute conversation this week to explore if there might be a mutual fit?</p>

            <p>Best regards,<br>
            ${process.env.EMAIL_SIGNATURE || "Your Name"}</p>

            <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                This email is intended for ${sanitizedName}. If you received this by mistake, please disregard it.
                To unsubscribe, please reply with "UNSUBSCRIBE" in the subject line.
            </p>
        </body>
        </html>
    `.trim();
};

const validateEnvironment = () => {
  const required = ["EMAIL_USER", "EMAIL_PASSWORD", "EMAIL_LIMIT"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      "Missing required environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }

  if (!process.env.EMAIL_USER.includes("@")) {
    console.error("Invalid email format in EMAIL_USER");
    process.exit(1);
  }
};

const validateExcelStructure = (data) => {
  const requiredColumns = ["Name", "Email", "Title", "Company"];
  const headers = Object.keys(data[0] || {});

  const missingColumns = requiredColumns.filter(
    (col) => !headers.includes(col)
  );
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  const invalidEmails = data.filter(
    (row) => !row.Email || !row.Email.includes("@")
  );
  if (invalidEmails.length > 0) {
    throw new Error(
      `Found ${invalidEmails.length} rows with invalid email addresses`
    );
  }
};

// Create Gmail OAuth2 transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 3000,
    rateLimit: 30,
  });
};

const sendEmailWithRetry = async (transporter, mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✓ Email sent successfully to ${mailOptions.to}`);
      return true;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(
          `✗ Failed to send email to ${mailOptions.to} after ${maxRetries} attempts:`,
          error.message
        );
        return false;
      }
      console.log(`Attempt ${attempt} failed, retrying in 5 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

async function sendEmails() {
  try {
    validateEnvironment();

    let successful = 0;
    let failed = 0;
    const startTime = Date.now();

    const filePath = process.argv[2];
    if (!filePath || !filePath.endsWith(".xlsx")) {
      throw new Error("Please provide a valid Excel (.xlsx) file path");
    }

    console.log("📊 Loading Excel file...");
    const workbook = xlsx.readFile(filePath);
    const data = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );

    validateExcelStructure(data);
    console.log(`📝 Found ${data.length} recipients`);

    // Create transporter
    const transporter = createTransporter();
    console.log("🔄 Verifying SMTP connection...");
    await transporter.verify();

    // Process emails
    const emailLimit = Math.min(parseInt(process.env.EMAIL_LIMIT), data.length);
    console.log(`🚀 Starting to send emails (limit: ${emailLimit})`);

    for (let i = 0; i < emailLimit; i++) {
      const row = data[i];
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: row.Email,
        subject: `Exploring Developer Opportunities at ${row.Company}`,
        html: getEmailBody(row.Name, row.Title, row.Company),
      };

      const success = await sendEmailWithRetry(transporter, mailOptions);
      if (success) successful++;
      else failed++;

      // Show progress
      console.log(
        `Progress: ${i + 1}/${emailLimit} (${Math.round(
          ((i + 1) / emailLimit) * 100
        )}%)`
      );
    }

    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log("\n📈 Summary:");
    console.log(`Duration: ${duration} seconds`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(
      `Success rate: ${((successful / emailLimit) * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Start the process
sendEmails().catch(console.error);
