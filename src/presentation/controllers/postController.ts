import { Request, Response } from "express";
import { PostRepository } from "../../infrastructure/repositories/PostRepository";
import { createPost, deletePost, getPostById, listPosts, updatePost } from "../../application/use-cases/forum/postUseCases";
import { AuthRequest } from "../types/AuthRequest";
import { canModifyPost } from "../../application/use-cases/forum/postPermissions";
import { toggleLike } from "../../application/use-cases/forum/likeUseCases";

const postRepo = new PostRepository();

export const createPostController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { title, content } = req.body;

    const post = await createPost(title, content, req.user.userId);
    return res.status(201).json(post);
  } catch (error: unknown) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create post" });
  }
};

export const listPostsController = async (_req: Request, res: Response) => {
  const posts = await listPosts();
  return res.status(200).json(posts);
};

export const updatePostController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const postId = String(req.params.postId);

    const post = await getPostById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!canModifyPost(req.user, post)) {
      return res.status(403).json({ message: "You cannot modify this post" });
    }

    const updated = await updatePost(postId, {
      title: req.body.title,
      content: req.body.content,
    });

    return res.status(200).json(updated);
  } catch (error: unknown) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update post" });
  }
};

export const deletePostController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const postId = String(req.params.postId);

    const post = await postRepo.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!canModifyPost(req.user, post)) {
      return res.status(403).json({ message: "You cannot delete this post" });
    }

    await deletePost(postId);
    return res.status(200).json({ message: "Post deleted" });
  } catch (error: unknown) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Failed to delete post" });
  }
};

export const toggleLikeController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const postId = String(req.params.postId);

    const post = await postRepo.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const result = await toggleLike(postId, req.user.userId);
    return res.status(200).json(result);
  } catch (error: unknown) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Failed to like post" });
  }
};
