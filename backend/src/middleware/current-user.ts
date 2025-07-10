import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define the expected shape of the token payload
interface UserPayload {
    userID: number;
    name: string;
    admin: boolean;
    id: string;
}

// Extend Express Request to include currentUser
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

// Middleware to decode token and attach current user to the request
export const currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    // Proceed with no user if no Authorization header
    if (!authHeader?.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.replace("Bearer ", "").trim();

    try {
        const payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
        req.currentUser = payload;
    } catch (err) {
        // Token invalid or expired — no crash, just continue without setting currentUser
    }

    next();
};
