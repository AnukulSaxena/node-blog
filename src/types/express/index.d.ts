// src/types/express/index.d.ts
import { IUser } from '../../models/User'; // Adjust path as needed

declare global {
    namespace Express {
        interface Request {
            user?: IUser | { _id: string }; // Attach user object or just id after authentication
        }
    }
}

// You might need to export something, even if empty, for TS to recognize it as a module
export {};