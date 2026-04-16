import { Comment } from "../../../domain/entities/Comment";
import { CommentRepository } from "../../../infrastructure/repositories/CommentRepository";

const commentRepo = new CommentRepository();

export const createComment = async (
  postId: string,
  content: string,
  authorId: string
): Promise<Comment> => {
  return commentRepo.create({ postId, content, authorId });
};

export const listCommentsByPost = async (postId: string): Promise<Comment[]> => {
  return commentRepo.findByPostId(postId);
};

export const updateComment = async (commentId: string, content: string): Promise<Comment | null> => {
  return commentRepo.update(commentId, content);
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  return commentRepo.delete(commentId);
};

export const getCommentById = async (commentId: string): Promise<Comment | null> => {
  return commentRepo.findById(commentId);
};
