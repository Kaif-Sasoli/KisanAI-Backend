import { Router } from "express";
import { sendEmail, verifyEmail } from "../controllers/verifyemail.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    sendVerificationOtpSchema,
    verifyEmailOtpSchema
} from '../schema/verify-email.schema.js'
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/send-email",
    authenticate,
    validate(sendVerificationOtpSchema),
    sendEmail
);


router.post("/verify-otp",
    validate(verifyEmailOtpSchema),
    verifyEmail
);

export default router;