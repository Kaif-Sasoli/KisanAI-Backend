import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../generated/prisma/enums";

// Authorize
export const authorize = (...allowedRoles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "You need to login first!",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource.",
            });
        }

        next();
    };