import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createPostController,
  deletePostController,
  listPostsController,
  toggleLikeController,
  updatePostController,
} from "../controllers/postController";

const router = express.Router();

router.get("/", listPostsController);
router.post("/", authMiddleware, createPostController);
router.put("/:postId", authMiddleware, updatePostController);
router.delete("/:postId", authMiddleware, deletePostController);
router.post("/:postId/like", authMiddleware, toggleLikeController);

export default router;
