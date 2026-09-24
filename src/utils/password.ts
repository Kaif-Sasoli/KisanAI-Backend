import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "../config/env.config.js";


// HashPassword
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));

    return bcrypt.hash(password, salt);
}

// ComparPassword
export const comparePassword = async (password: string, hashPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashPassword);
}

