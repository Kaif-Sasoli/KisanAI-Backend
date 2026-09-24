const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const forgotPasswordTemplate = (
    name: string,
    resetLink: string
) => {
    const safeName = escapeHtml(name);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f5; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
    <div style="width: 100%; padding: 40px 15px; box-sizing: border-box;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 32px 25px; text-align: center;">
                <div style="width: 60px; height: 60px; margin: 0 auto 15px; background: #ffffff; border-radius: 50%; line-height: 60px; font-size: 28px;">
                    🔐
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
                    Password Reset
                </h1>
                <p style="margin: 8px 0 0; color: #dcfce7; font-size: 14px;">
                    Secure your KisanAI account
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 35px 30px;">
                <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">
                    Hello <strong>${safeName}</strong>,
                </p>
                <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7; color: #4b5563;">
                    We received a request to reset the password for your KisanAI account.
                </p>
                <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.7; color: #4b5563;">
                    Click the button below to create a new password. This link is valid for <strong>15 minutes</strong>.
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 8px;">
                        Reset My Password
                    </a>
                </div>

                <!-- Expiry Notice -->
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #166534;">
                        ⏱️ <strong>This link expires in 15 minutes.</strong> For your security, please reset your password before the link expires.
                    </p>
                </div>

                <p style="margin: 25px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>

                <!-- Fallback Link -->
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">
                        If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; word-break: break-all; color: #16a34a;">
                        ${resetLink}
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 25px; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280;">
                    © ${new Date().getFullYear()} KisanAI
                </p>
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                    This is an automated security email. Please do not reply.
                </p>
            </div>

        </div>
    </div>
</body>
</html>`;
};