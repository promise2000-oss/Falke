export interface PasswordResetEmailTemplateOptions {
  resetUrl: string;
  firstName?: string;
  appName?: string;
  expiresInMinutes?: number;
  supportEmail?: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildPasswordResetEmailTemplate = ({
  resetUrl,
  firstName,
  appName = 'Aurikrex',
  expiresInMinutes = 45,
  supportEmail = 'support@aurikrex.com',
}: PasswordResetEmailTemplateOptions) => {
  const safeName = escapeHtml(firstName?.trim() || 'there');
  const safeAppName = escapeHtml(appName);
  const safeSupportEmail = escapeHtml(supportEmail);
  const safeResetUrl = escapeHtml(resetUrl);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:32px 32px 16px;background:linear-gradient(135deg, #0fbd74, #0a8f59);text-align:center;color:#ffffff;">
                <div style="font-size:24px;font-weight:700;">${safeAppName}</div>
                <div style="margin-top:8px;font-size:14px;opacity:0.9;">Secure password recovery</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;">Reset your password</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${safeName}, we received a request to reset your password.</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Click the button below to choose a new password. For your security, this link expires in ${expiresInMinutes} minutes and can only be used once.</p>

                <div style="text-align:center;margin:28px 0;">
                  <a href="${safeResetUrl}" style="display:inline-block;background:#0fbd74;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;">Reset Password</a>
                </div>

                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4b5563;">If you did not request this change, you can safely ignore this email. Your current password will remain unchanged.</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">Need help? Contact <a href="mailto:${safeSupportEmail}" style="color:#0fbd74;">${safeSupportEmail}</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
};

export const buildPasswordResetEmailText = ({
  resetUrl,
  firstName,
  appName = 'Aurikrex',
  expiresInMinutes = 45,
}: PasswordResetEmailTemplateOptions) => {
  const name = firstName?.trim() || 'there';

  return [
    `Hi ${name},`,
    '',
    `We received a request to reset your ${appName} password.`,
    `Use the link below to choose a new password: ${resetUrl}`,
    '',
    `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
    'If you did not request this, you can ignore this email.',
  ].join('\n');
};
