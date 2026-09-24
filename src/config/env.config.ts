import dotenv from 'dotenv'

dotenv.config({
    path: "./.env",
});


export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const FRONT_END_URL = process.env.FRONT_END_URL;


// jwt
export const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS);
export const JWT_SECRET = process.env.JWT_SECRET;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN || "refresh_token";
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "access_token";


// Cookie options
export const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: (process.env.COOKIE_SAME_SITE as
        "lax" | "strict" | "none") || "lax",
    maxAge: Number(process.env.COOKIE_MAX_AGE) || 86400000,
};


// Firebase
export const projectId = process.env.FIREBASE_PROJECT_ID;
export const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
export const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");


// cors options
const allowedOrigins = [
    process.env.FRONT_END_URL,
    "http://localhost:3000",
    "http://localhost:5174",
    "https://your-frontend.vercel.app",
];

export const corsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
};