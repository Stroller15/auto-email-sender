# Bulk Email Sender for Developer Outreach

A Node.js application for sending personalized bulk emails to potential developer candidates. The application reads recipient data from an Excel file and sends professional HTML emails with proper rate limiting and error handling.

## Features

- 📊 Excel file support for managing recipient data
- ✉️ Professional HTML email templates
- 🔄 Automatic retry logic for failed emails
- ⚡ Rate limiting to prevent spam flags
- 🔒 Input sanitization and validation
- 📈 Progress tracking and success rate reporting
- 🎨 Customizable email templates
- ⏱️ Connection pooling for better performance

## Prerequisites

- Node.js (v14 or higher)
- Gmail account
- Gmail App Password (2FA must be enabled)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Stroller15/auto-bulk-email-sender.git
cd auto-bulk-email-sender
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_LIMIT=50
EMAIL_SIGNATURE=Your Name
```

## Setting up Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Step Verification if not already enabled
3. Go to Security → App passwords
4. Select "Mail" and "Other (Custom name)"
5. Copy the generated password and use it in your `.env` file

## Preparing the Excel File

Create an Excel file with the following columns:
- `Name`: Full name of the recipient
- `Email`: Valid email address
- `Title`: Current job title
- `Company`: Company name

Example:
| Name | Email | Title | Company |
|------|--------|--------|---------|
| John Doe | john@example.com | Senior Developer | Tech Corp |
| Jane Smith | jane@example.com | Lead Engineer | Dev Inc |

## Usage

Run the application with:
```bash
node emailSender.js path/to/your/excel-file.xlsx
```

The script will:
1. Validate your environment variables
2. Load and validate the Excel file
3. Verify SMTP connection
4. Send emails with progress tracking
5. Display a summary report

## Rate Limiting

The application includes built-in rate limiting:
- Maximum 1 concurrent connection
- 2-second delay between emails
- Maximum 30 emails per minute

These settings can be modified in the `createTransporter` function.

## Error Handling

- Retries failed emails up to 3 times
- 5-second delay between retry attempts
- Detailed error logging
- Input validation for all data

## Customization

### Email Template

The email template can be customized by modifying the `getEmailBody` function. The current template includes:
- Personalized greeting
- Professional formatting
- Responsive design
- Unsubscribe information
- XSS protection

### Configuration

Adjust these environment variables in your `.env` file:
- `EMAIL_LIMIT`: Maximum number of emails to send
- `EMAIL_SIGNATURE`: Your signature for the emails

## Security Considerations

- Use environment variables for sensitive data
- Input sanitization prevents XSS attacks
- Rate limiting prevents spam flagging
- Validates email addresses and data structure

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

Please ensure you comply with all applicable email regulations and privacy laws in your jurisdiction. This tool should only be used for legitimate business communications with proper consent from recipients.
