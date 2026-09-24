import bcrypt from "bcryptjs";

// Generate OTP
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// hashOTP
export function hashOTP(otp: string) {
    return bcrypt.hash(otp, 10);
}

// Compare OTP
export const compareOTP = async (otp: string, hash: string) => {
    return bcrypt.compare(otp, hash);
};