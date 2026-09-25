import { UserRole, AuthProvider } from "../../generated/prisma/enums.js";


export interface User {
    id: string;
    email: string | null;
    fullName: string;
    role: UserRole;
    providerType: AuthProvider;
    profileImageUrl: string | null;
}


declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}