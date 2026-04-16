import express from "express";
import {
  createCommentController,
  deleteCommentController,
  listCommentsController,
  updateCommentController,
} from "../controllers/commentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router({ mergeParams: true });

router.get("/", listCommentsController);
router.post("/", authMiddleware, createCommentController);
router.put("/:commentId", authMiddleware, updateCommentController);
router.delete("/:commentId", authMiddleware, deleteCommentController);

export default router;
