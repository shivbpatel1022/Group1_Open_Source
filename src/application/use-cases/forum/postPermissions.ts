import { Post } from "../../../domain/entities/Post";
import { User } from "../../../domain/entities/User";
import { AuthUserPayload } from "../../../presentation/types/AuthRequest";

export const canModifyPost = (user: AuthUserPayload, post: Post): boolean => {
  if (user.role === "super") return true;
  return post.authorId === user.userId;
};

export const canModifyComment = (
  user: AuthUserPayload,
  commentAuthorId: string,
  postOwnerId: string
): boolean => {
  if (user.role === "super") return true;
  if (user.userId === commentAuthorId) return true;
  return user.userId === postOwnerId && user.role !== "user";
};

export const canAccessAdminStats = (role: User["role"]): boolean => {
  return role === "admin" || role === "super";
};
