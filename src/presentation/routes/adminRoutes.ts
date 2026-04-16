import express from "express";
import { getAdminStatsController, updateUserRoleController } from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/stats", authMiddleware, isAdmin, getAdminStatsController);
router.patch("/users/:userId/role", authMiddleware, isAdmin, updateUserRoleController);

export default router;
