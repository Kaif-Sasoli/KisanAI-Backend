import { prisma } from "../lib/prisma.js";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from '../config/env.config.js'
import jwt from "jsonwebtoken";
import { CustomJwtPayload } from "../types/jwt.js";
import { ACCESS_TOKEN } from "../config/env.config.js";
import "../types/request.type.js";

// Authentication Middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from cookie or header
        const token = req.cookies?.[ACCESS_TOKEN] || req.headers["authorization"]?.split(" ")[1];

        if (!token) return res.status(401)
            .json({ success: false, message: "You need to login first!" });

        // decode token
        const decoded = jwt.verify(token, JWT_SECRET as string) as CustomJwtPayload;

        // find user
        const user = await prisma.user.findUnique({
            where: { id: decoded?.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                providerType: true,
                profileImageUrl: true
            }
        });

        if (!user) return res.status(401).json({
            success: false,
            message: "User not found"
        });

        req.user = user;

        next();

    } catch (error: any) {
        if (error instanceof jwt.TokenExpiredError)
            return res.status(401).json({ success: false, message: "Access token expired" });

        if (error instanceof jwt.JsonWebTokenError)
            return res.status(401).json({ success: false, message: "Invalid access token" });

        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    }
}
