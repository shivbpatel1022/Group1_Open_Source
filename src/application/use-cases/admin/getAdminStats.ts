import { CommentRepository } from "../../../infrastructure/repositories/CommentRepository";
import { LikeRepository } from "../../../infrastructure/repositories/LikeRepository";
import { PostRepository } from "../../../infrastructure/repositories/PostRepository";
import { UserRepository } from "../../../infrastructure/repositories/UserRepository";

const userRepo = new UserRepository();
const postRepo = new PostRepository();
const commentRepo = new CommentRepository();
const likeRepo = new LikeRepository();

export const getAdminStats = async () => {
  const [totalUsers, totalPosts, totalComments, totalLikes, admins, supers] = await Promise.all([
    userRepo.countAll(),
    postRepo.countAll(),
    commentRepo.countAll(),
    likeRepo.countAll(),
    userRepo.countByRole("admin"),
    userRepo.countByRole("super"),
  ]);

  return {
    users: {
      total: totalUsers,
      admins,
      supers,
      regularUsers: totalUsers - admins - supers,
    },
    content: {
      posts: totalPosts,
      comments: totalComments,
      likes: totalLikes,
    },
  };
};
