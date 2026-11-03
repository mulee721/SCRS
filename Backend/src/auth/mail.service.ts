import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const mailService = this.config.get<string>('MAIL_SERVICE') || 'gmail';
    const mailUser = this.config.get<string>('MAIL_USER') || 'your-email@gmail.com';
    const mailPassword = this.config.get<string>('MAIL_PASSWORD') || 'your-app-password';

    this.transporter = nodemailer.createTransport({
      service: mailService,
      auth: {
        user: mailUser,
        pass: mailPassword,
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string, name: string): Promise<void> {
    const from = this.config.get<string>('MAIL_USER');
    const university = this.config.get<string>('UNIVERSITY_NAME') || 'Addis Valley University';

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${university}" <${from}>`,
      to: email,
      subject: 'Password Reset Code – SCRS',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#1B2938;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1B2938;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width:520px;background:#202D3D;border-radius:16px;overflow:hidden;border:1px solid #34485E;">
                  <!-- header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#00DCEB20,#00BFD410);padding:32px;text-align:center;border-bottom:1px solid #34485E;">
                      <div style="display:inline-flex;align-items:center;gap:10px;">
                        <div style="width:40px;height:40px;border-radius:10px;background:#00DCEB20;border:1.5px solid #00DCEB40;display:inline-flex;align-items:center;justify-content:center;">
                          <span style="font-size:20px;">🎓</span>
                        </div>
                        <span style="color:#00DCEB;font-size:18px;font-weight:800;">SCRS</span>
                      </div>
                      <h2 style="color:#F1F5F9;margin:16px 0 4px;font-size:22px;font-weight:700;">Password Reset</h2>
                      <p style="color:#94A3B8;margin:0;font-size:14px;">${university}</p>
                    </td>
                  </tr>
                  <!-- body -->
                  <tr>
                    <td style="padding:32px;">
                      <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                        Hi <strong style="color:#F1F5F9;">${name}</strong>,<br><br>
                        You requested a password reset for your SCRS account. Use the code below to reset your password.
                      </p>

                      <!-- code box -->
                      <div style="background:#162030;border:2px solid #00DCEB40;border-radius:14px;padding:28px;text-align:center;margin:0 0 24px;">
                        <p style="color:#94A3B8;font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px;">Your reset code</p>
                        <div style="letter-spacing:12px;font-size:42px;font-weight:900;color:#00DCEB;font-family:monospace;text-shadow:0 0 20px #00DCEB60;">
                          ${code}
                        </div>
                        <p style="color:#94A3B8;font-size:12px;margin:16px 0 0;">
                          ⏱ This code expires in <strong style="color:#F1F5F9;">10 minutes</strong>
                        </p>
                      </div>

                      <p style="color:#94A3B8;font-size:13px;line-height:1.6;margin:0 0 8px;">
                        If you did not request this, please ignore this email. Your password will not change.
                      </p>
                      <p style="color:#94A3B8;font-size:13px;margin:0;">
                        For help, contact <a href="mailto:registrar@scrs.edu" style="color:#00DCEB;">registrar@scrs.edu</a>
                      </p>
                    </td>
                  </tr>
                  <!-- footer -->
                  <tr>
                    <td style="background:#111D2B;padding:20px 32px;border-top:1px solid #34485E;text-align:center;">
                      <p style="color:#475569;font-size:12px;margin:0;">
                        © ${new Date().getFullYear()} ${university}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset code sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw new Error('Failed to send reset email. Please try again later.');
    }
  }
}
