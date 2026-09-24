import nodemailer from 'nodemailer';

// Transport Config
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST as string,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export default transporter;