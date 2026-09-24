import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";
import { generateOTP, hashOTP, compareOTP } from "../utils/generateOtp.js";
import { sendMail } from "../services/sendmail.service.js"
import { verifyOtpTemplate } from "../templates/verifyOtp.js";

// Verfiy Email
export const sendEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Check 
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Delete previous verfications reqs
        await prisma.emailVerification.deleteMany({
            where: { email }
        });

        const otp = generateOTP();
        const otpHash = await hashOTP(otp)

        // create table
        await prisma.emailVerification.create({
            data: {
                email,
                otpHash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            }
        });

        // send mail
        await sendMail({
            to: email,
            subject: "Verify Your KisanAI Account",
            html: verifyOtpTemplate("OTP", otp)
        })

        // response
        return res.json({
            success: true,
            message: "Email is sent Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internel Server Error!"
        })
    }
}

// Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        const verification = await prisma.emailVerification.findFirst({
            where: { email },
        });

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: "Verification request not found.",
            });
        }

        if (verification.expiresAt < new Date()) {
            await prisma.emailVerification.delete({
                where: { id: verification.id },
            });

            return res.status(400).json({
                success: false,
                message: "OTP has expired.",
            });
        }

        const isValid = await compareOTP(otp.toString(), verification.otpHash);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        await prisma.emailVerification.delete({
            where: { id: verification.id },
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};