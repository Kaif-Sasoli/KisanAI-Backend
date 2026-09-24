import transporter from "../config/mail.config.js";
import { MailOptions } from '../types/mail.types.js'

export const sendMail = async ({
    to,
    subject,
    html,
}: MailOptions) => {
    try {
        return await transporter.sendMail({
            from: `"KisanAI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.log("error: ", error)
    }
};