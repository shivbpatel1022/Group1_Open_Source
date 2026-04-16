import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true, index: true },
    content: { type: String, required: true, trim: true },
    authorId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const CommentModel = mongoose.model("Comment", commentSchema);
