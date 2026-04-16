import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    authorId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const PostModel = mongoose.model("Post", postSchema);
