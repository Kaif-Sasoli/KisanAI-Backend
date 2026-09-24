const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const verifyOtpTemplate = (
    name: string,
    otp: string
) => {
    const safeName = escapeHtml(name);
    const safeOtp = escapeHtml(otp);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f5; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
    <div style="width: 100%; padding: 40px 15px; box-sizing: border-box;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 32px 25px; text-align: center;">
                <div style="width: 60px; height: 60px; margin: 0 auto 15px; background: #ffffff; border-radius: 50%; line-height: 60px; font-size: 28px;">
                    ✉️
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
                    Verify Your Email
                </h1>
                <p style="margin: 8px 0 0; color: #dcfce7; font-size: 14px;">
                    Welcome to KisanAI
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 35px 30px;">
                <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">
                    Hello <strong>${safeName}</strong>,
                </p>
                <p style="margin: 0 0 25px; font-size: 15px; line-height: 1.7; color: #4b5563;">
                    Thanks for signing up for KisanAI. Please use the verification code below to confirm your email address.
                </p>

                <!-- OTP -->
                <div style="text-align: center; margin: 30px 0;">
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                        Your Verification Code
                    </p>
                    <div style="display: inline-block; background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 16px 25px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #15803d;">
                            ${safeOtp}
                        </span>
                    </div>
                </div>

                <!-- Expiry -->
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #166534;">
                        ⏱️ <strong>This code expires in 10 minutes.</strong> Please enter it before it expires.
                    </p>
                </div>

                <p style="margin: 25px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
                    If you didn't request this verification code, you can safely ignore this email.
                </p>
                <p style="margin: 15px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
                    For your security, never share this code with anyone.
                </p>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 25px; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280;">
                    © ${new Date().getFullYear()} KisanAI
                </p>
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                    This is an automated email. Please do not reply.
                </p>
            </div>

        </div>
    </div>
</body>
</html>`;
};