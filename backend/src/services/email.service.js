const { Resend } = require("resend");
const { env } = require("../config/env");

let resendClient = null;
function getResend() {
  if (!resendClient) {
    if (!env.resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }
    resendClient = new Resend(env.resendApiKey);
  }
  return resendClient;
}

async function sendVerificationEmail(to, fullName, token) {
  const verifyUrl = `${env.appUrl}/api/auth/verify-email?token=${token}`;
  const { error } = await getResend().emails.send({
    from: env.resendFromEmail,
    to,
    subject: "Verify your Heritage360 account",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
                <tr>
                  <td style="background:#C8102E;padding:24px 32px;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.5px;">Heritage360</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Hi ${fullName},</p>
                    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">Thanks for creating your Heritage360 account. Click the button below to verify your email address and get started.</p>
                    <a href="${verifyUrl}" style="display:inline-block;background:#C8102E;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;">Verify my account</a>
                    <p style="margin:24px 0 8px;font-size:13px;color:#9ca3af;">Or paste this link into your browser:</p>
                    <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;">${verifyUrl}</p>
                    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `
  });

  if (error) {
    throw new Error(error.message || "Resend rejected the email request.");
  }
}

module.exports = { sendVerificationEmail };
