import { User } from "../../generated/prisma/client";
import { UserRole, AuthProvider } from "../../generated/prisma/client";


export interface AuthenticatedUser {
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
            user?: AuthenticatedUser | null;
        }
    }
}