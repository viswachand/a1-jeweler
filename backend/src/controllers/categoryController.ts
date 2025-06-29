import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Category } from '../models/categoryModel';
import { BadRequestError } from '../errors/badRequest-error';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public or Admin (You can secure it later)
export const addCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;

    // Validation
    if (!name || name.trim() === '') {
        throw new BadRequestError('Category name is required');
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });

    if (existingCategory) {
        throw new BadRequestError('Category already exists');
    }

    const category = Category.build({ name: name.trim() });
    await category.save();

    res.status(201).json({ category });
});


// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await Category.find({}).sort({ name: 1 }); // Sorted alphabetically
    res.status(200).json(categories);
});
