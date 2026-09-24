import { NextFunction, Router, Request, Response } from "express";
import * as auth from "../controllers/auth.controller.js"
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    registerSchema,
    signinSchema,
    changePasswordSchema,
    forgotPassword,
    resetPassword
} from "../schema/auth.schema.js"


const router = Router();

// SignUp
router.post(
    "/signup",
    validate(registerSchema),
    auth.register
);

// SignIn
router.post(
    "/signin",
    validate(signinSchema),
    auth.signin
);

// Google Auth
router.post(
    "/google",
    auth.googleAuth
);

// Refresh Token
router.post("/refresh",
    auth.refreshAccessToken
);

// Logout
router.post(
    "/logout",
    authenticate,
    auth.logout
);

// change password
router.patch("/change-password",
    authenticate,
    validate(changePasswordSchema),
    auth.changePassword
);

// Forget Password
router.post(
    "/forget-password",
    validate(forgotPassword),
    auth.forgotPassword
);

// Reset-Password
router.post(
    "/reset-password",
    validate(resetPassword),
    auth.restPassword
);

export default router;