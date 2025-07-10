import express from "express";
import { clockIn, clockOut, getClockSummary, getUserClockSummary } from "../controllers/clockSummaryController";
import { currentUser } from "../middleware/current-user";
import { requireAuth } from "../middleware/require-auth";
const router = express.Router()

router.route('/clockIn/:id').get(currentUser, requireAuth, clockIn);
router.route('/clockOut/:id').get(currentUser, requireAuth, clockOut);
router.route('/clockSummary').get(getClockSummary);
router.route('/:id').get(currentUser, requireAuth, getUserClockSummary)

export default router