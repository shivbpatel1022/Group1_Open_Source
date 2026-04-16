import { Comment } from "../../domain/entities/Comment";
import { ICommentRepository } from "../../domain/interfaces/ICommentRepository";
import { CommentModel } from "../database/CommentModel";

export class CommentRepository implements ICommentRepository {
  async create(comment: Comment): Promise<Comment> {
    const saved = await new CommentModel(comment).save();
    return {
      id: saved._id.toString(),
      postId: saved.postId,
      content: saved.content,
      authorId: saved.authorId,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async findById(id: string): Promise<Comment | null> {
    const comment = await CommentModel.findById(id);
    if (!comment) return null;

    return {
      id: comment._id.toString(),
      postId: comment.postId,
      content: comment.content,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    const comments = await CommentModel.find({ postId }).sort({ createdAt: -1 });
    return comments.map((comment) => ({
      id: comment._id.toString(),
      postId: comment.postId,
      content: comment.content,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  }

  async update(id: string, content: string): Promise<Comment | null> {
    const updated = await CommentModel.findByIdAndUpdate(id, { content }, { new: true });
    if (!updated) return null;

    return {
      id: updated._id.toString(),
      postId: updated.postId,
      content: updated.content,
      authorId: updated.authorId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await CommentModel.findByIdAndDelete(id);
    return result !== null;
  }

  async countAll(): Promise<number> {
    return CommentModel.countDocuments();
  }

  async countByAuthor(authorId: string): Promise<number> {
    return CommentModel.countDocuments({ authorId });
  }
}
