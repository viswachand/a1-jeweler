import express from "express";
import { signIn, signUp, getCurrentUser } from "../controllers/userController";
import { currentUser } from "../middleware/current-user";
import { requireAuth } from "../middleware/require-auth";
const router = express.Router()

router.route('/signup').post(signUp);
router.route('/login').post(signIn);
router.route('/currentuser').get(currentUser, requireAuth, getCurrentUser);

export default router