// https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
// @ts-ignore
import dotenv from 'dotenv';
import axios from 'axios';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM = process.env.MAILSERVER_FROM || 'no-reply@onepagerules.com';
const BASE = process.env.PATREON_REDIRECT_BASE || 'https://webapp.onepagerules.com';

// const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

export default class MailService {

  public static async sendPasswordResetMail(to: string, username: string, resetToken: string): Promise<boolean> {
    try {
      await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            { to: [{ email: to, name: username }] },
          ],
          from: { email: FROM, name: 'onepagerules' },
          subject: '[WebApp] Password Reset',
          content: [
            {
              type: 'text/html',
              value: `
                <div style="font-family: Tahoma, sans-serif">
                  <h1>Reset your password to access OPR WebApp</h1>
                  <p>Hi ${username},</p>
                  <p>did you request a password reset for the OPR Web App? If so use the following link to <a href="${BASE}/auth/reset-password?token=${resetToken}">change your password.</a></p>
                  <p>Kind regards,<br>Your OPR Team</p>
                </div>
            `,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (e) {
      console.info(JSON.stringify(e));
      console.error('failed ->', 'https://api.sendgrid.com/v3/mail/send', API_KEY, e);
      return false;
    }
  }

}
