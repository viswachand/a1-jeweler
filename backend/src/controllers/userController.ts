import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { validationResult, body } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "../errors/badRequest-error";
import { User } from "../models/userModel";

// User Registration Controller
const signUp = asyncHandler(async (req: Request, res: Response) => {
    // Validate userID (assuming userID is your primary identifier)
    await body("userID")
        .notEmpty()
        .withMessage("UserID is required")
        .run(req);

    // Validate password length
    await body("password")
        .isLength({ min: 2, max: 4 })
        .withMessage("Password must be at least 2 characters and at most 4 characters")
        .run(req);

    // Validate name
    await body("name")
        .notEmpty()
        .withMessage("Name is required")
        .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    const { name, userID, password, admin } = req.body;

    const existingUser = await User.findOne({ userID });

    if (existingUser) {
        throw new BadRequestError("User already exists with this userID");
    }

    const user = User.build({
        name,
        userID,
        password,
        admin,
    });

    await user.save();

    res.status(201).json(user);
});

const signIn = asyncHandler(async (req: Request, res: Response) => {
    await body("userID")
        .notEmpty()
        .withMessage("UserID is required")
        .run(req);

    // Validate password length
    await body("password")
        .trim().notEmpty().withMessage('You must apply a password')
        .run(req);
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    const { userID, password } = req.body;
    const user = await User.findOne({ userID });

    if (!user) {
        throw new BadRequestError("Invalid userID or password");
    }

    if (String(user.password) !== String(password)) {
        throw new BadRequestError("Invalid userID or password");
    }

    const userJwt = jwt.sign(
        {
            userID: user.userID,
            name: user.name,
            admin: user.admin,
        },
        process.env.JWT_KEY!
    );

    // store it on session object

    req.session = {
        jwt: userJwt
    }
    res.status(200).send(user)
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).send({ currentUser: req.currentUser || null });
});

const signOut = asyncHandler(async (req: Request, res: Response) => {
    req.session = null;
    res.send({});
});

export { signUp, signIn, signOut, getCurrentUser };
