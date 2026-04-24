import { Response } from "express";
import {
  createComment,
  deleteComment,
  getCommentById,
  listCommentsByPost,
  updateComment,
} from "../../application/use-cases/forum/commentUseCases";
import { getPostById } from "../../application/use-cases/forum/postUseCases";
import { canModifyComment } from "../../application/use-cases/forum/postPermissions";
import { AuthRequest } from "../types/AuthRequest";

export const createCommentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const postId = String(req.params.postId);

    const post = await getPostById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await createComment(
      postId,
      req.body.content,
      req.user.userId,
    );
    return res.status(201).json(comment);
  } catch (error: unknown) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to add comment",
    });
  }
};

export const listCommentsController = async (
  req: AuthRequest,
  res: Response,
) => {
  const comments = await listCommentsByPost(String(req.params.postId));
  return res.status(200).json(comments);
};

export const updateCommentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const commentId = String(req.params.commentId);

    const comment = await getCommentById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const post = await getPostById(comment.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!canModifyComment(req.user, comment.authorId, post.authorId)) {
      return res
        .status(403)
        .json({ message: "You cannot modify this comment" });
    }

    const updated = await updateComment(commentId, req.body.content);
    return res.status(200).json(updated);
  } catch (error: unknown) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to update comment",
    });
  }
};

export const deleteCommentController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const commentId = String(req.params.commentId);

    const comment = await getCommentById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const post = await getPostById(comment.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!canModifyComment(req.user, comment.authorId, post.authorId)) {
      return res
        .status(403)
        .json({ message: "You cannot delete this comment" });
    }

    await deleteComment(commentId);
    return res.status(200).json({ message: "Comment deleted" });
  } catch (error: unknown) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to delete comment",
    });
  }
};
