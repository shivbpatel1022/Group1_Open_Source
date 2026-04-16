import { ILikeRepository } from "../../domain/interfaces/ILikeRepository";
import { LikeModel } from "../database/LikeModel";

export class LikeRepository implements ILikeRepository {
  async exists(postId: string, userId: string): Promise<boolean> {
    const like = await LikeModel.findOne({ postId, userId });
    return like !== null;
  }

  async create(postId: string, userId: string): Promise<void> {
    await new LikeModel({ postId, userId }).save();
  }

  async delete(postId: string, userId: string): Promise<void> {
    await LikeModel.findOneAndDelete({ postId, userId });
  }

  async countByPost(postId: string): Promise<number> {
    return LikeModel.countDocuments({ postId });
  }

  async countAll(): Promise<number> {
    return LikeModel.countDocuments();
  }
}
