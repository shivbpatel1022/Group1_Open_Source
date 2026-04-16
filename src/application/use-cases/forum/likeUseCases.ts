import { LikeRepository } from "../../../infrastructure/repositories/LikeRepository";

const likeRepo = new LikeRepository();

export const toggleLike = async (postId: string, userId: string) => {
  const alreadyLiked = await likeRepo.exists(postId, userId);

  if (alreadyLiked) {
    await likeRepo.delete(postId, userId);
  } else {
    await likeRepo.create(postId, userId);
  }

  const likesCount = await likeRepo.countByPost(postId);
  return {
    liked: !alreadyLiked,
    likesCount,
  };
};
