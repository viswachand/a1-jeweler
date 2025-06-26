import express, { Request, Response, NextFunction } from 'express'
import { NotAuthroizedError } from '../errors/not-authroized-error'

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {

    if (!req.currentUser) {
        throw new NotAuthroizedError();
    }

    next();
}