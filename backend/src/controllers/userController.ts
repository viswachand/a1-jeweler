import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "../errors/badRequest-error";
import { User } from "../models/userModel";

interface userPayload {
    userID: number;
    name: string;
    admin: boolean;
    id: string;
}

// Helper to generate JWT
const generateToken = (user: userPayload): string => {
    return jwt.sign(user, process.env.JWT_KEY!, { expiresIn: "2h" });
};

// @desc    Register user
// @route   POST /api/users/signup
export const signUp = asyncHandler(async (req: Request, res: Response) => {
    await body("userID").notEmpty().withMessage("UserID is required").run(req);
    await body("password")
        .isLength({ min: 2, max: 4 })
        .withMessage("Password must be 2–4 characters long")
        .run(req);
    await body("name").notEmpty().withMessage("Name is required").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    const { name, userID, password, admin } = req.body;

    const existingUser = await User.findOne({ userID });
    if (existingUser) {
        throw new BadRequestError("User already exists with this userID");
    }

    const user = User.build({ name, userID, password, admin });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
});

// @desc    Login user and return JWT
// @route   POST /api/users/login
export const signIn = asyncHandler(async (req: Request, res: Response) => {
    await body("userID").notEmpty().withMessage("UserID is required").run(req);
    await body("password")
        .trim()
        .notEmpty()
        .withMessage("You must supply a password")
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    const { userID, password } = req.body;
    const user = await User.findOne({ userID });

    if (!user || String(user.password) !== String(password)) {
        throw new BadRequestError("Invalid userID or password");
    }

    const userJwt = generateToken({
        userID: user.userID,
        name: user.name,
        admin: user.admin,
        id: user.id.toString(),
    });

    res.status(200).json({
        message: "Login successful",
        token: userJwt,
        user: {
            userID: user.userID,
            name: user.name,
            admin: user.admin,
            id: user.id.toString(),
        },
    });
});

// @desc    Get current authenticated user (via Bearer token)
// @route   GET /api/users/currentuser
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ currentUser: req.currentUser || null });
});
