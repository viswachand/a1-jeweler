import { Request, Response } from "express";
import { Policy } from "../models/policyModel";
import { BadRequestError } from "../errors/badRequest-error";

// Create Policy
const createPolicy = async (req: Request, res: Response) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new BadRequestError("Title and description are required.");
    }

    try {
        // Check for existing policy with the same title (case-insensitive)
        const existing = await Policy.findOne({
            title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
        });
        if (existing) {
            throw new BadRequestError("A policy with this title already exists.");
        }

        const policy = Policy.build({ title, description });
        await policy.save();

        res.status(201).json(policy);
    } catch (error) {
        if (error instanceof BadRequestError) {
            throw error;
        }

        throw new BadRequestError("Failed to create new policy.");
    }
};

// Get All Policies
const getPolicies = async (_req: Request, res: Response) => {
    try {
        const policies = await Policy.find().sort({ createdAt: -1 });
        res.status(200).json(policies);
    } catch (error) {
        console.error("Fetch Policies Error:", error);
        throw new BadRequestError("Failed to fetch policies.");
    }
};

// Update Policy
const updatePolicy = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        throw new BadRequestError("Title and description are required.");
    }

    try {
        const updated = await Policy.findByIdAndUpdate(
            id,
            { title, description },
            { new: true, runValidators: true }
        );

        if (!updated) {
            throw new BadRequestError("Policy not found.");
        }

        res.status(200).json(updated);
    } catch (error) {
        if (error instanceof BadRequestError) {
            throw error;
        }

        throw new BadRequestError("Failed to create new policy.");
    }
};

const deletePolicy = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const deleted = await Policy.findByIdAndDelete(id);

    if (!deleted) {
        throw new BadRequestError("Policy not found.");
    }

    res.status(204).send();
};

export { deletePolicy, createPolicy, getPolicies, updatePolicy };
