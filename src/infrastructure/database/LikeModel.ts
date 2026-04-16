import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const LikeModel = mongoose.model("Like", likeSchema);
