import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { toEmail, summary, subject } = await req.json()

    if (!toEmail || !summary) {
      return NextResponse.json(
        { error: 'Recipient email and summary are required' },
        { status: 400 }
      )
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: 'Email configuration is missing. Please set EMAIL_USER and EMAIL_PASS in .env' },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: subject || 'Meeting Summary',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            h2 {
              color: #0070f3;
              border-bottom: 2px solid #0070f3;
              padding-bottom: 10px;
            }
            .summary-content {
              background-color: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h2>Meeting Summary</h2>
          <div class="summary-content">${summary.replace(/\n/g, '<br>')}</div>
          <div class="footer">
            This email was sent via AI Meeting Summarizer
          </div>
        </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email. Please check your email configuration.' },
      { status: 500 }
    )
  }
}