import express from "express";
import {
    createPolicy,
    updatePolicy,
    getPolicies,
    deletePolicy,
} from "../controllers/policyContoller";
import { currentUser } from "../middleware/current-user";
import { requireAuth } from "../middleware/require-auth";
const router = express.Router();

router.use(currentUser, requireAuth);

router.route("/create").post(createPolicy);
router.route("/get").get(getPolicies);
router.route("/update/:id").put(updatePolicy);
router.route("/delete/:id").delete(deletePolicy);

export default router;
