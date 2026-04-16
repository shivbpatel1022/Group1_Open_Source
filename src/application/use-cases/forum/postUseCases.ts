import { Post } from "../../../domain/entities/Post";
import { PostRepository } from "../../../infrastructure/repositories/PostRepository";

const postRepo = new PostRepository();

export const createPost = async (title: string, content: string, authorId: string): Promise<Post> => {
  return postRepo.create({ title, content, authorId });
};

export const listPosts = async (): Promise<Post[]> => {
  return postRepo.findAll();
};

export const updatePost = async (
  postId: string,
  data: Partial<Pick<Post, "title" | "content">>
): Promise<Post | null> => {
  return postRepo.update(postId, data);
};

export const deletePost = async (postId: string): Promise<boolean> => {
  return postRepo.delete(postId);
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  return postRepo.findById(postId);
};
