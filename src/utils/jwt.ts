import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import {
    JWT_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
} from '../config/env.config.js';


// Generate Access Token
export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(
        payload,
        JWT_SECRET || '',
        { expiresIn: ACCESS_TOKEN_EXPIRY as any }
    )
}
// Generate Refresh Token
export const genearteRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(
        payload,
        JWT_SECRET || '',
        { expiresIn: REFRESH_TOKEN_EXPIRY as any }
    )
}

// Verify Refresh Token
export const verifyRefreshToken = (token: string) => {
    return jwt.verify(
        token,
        JWT_SECRET || ''
    ) as { id: string };
};