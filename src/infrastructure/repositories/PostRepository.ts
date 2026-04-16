import { Post } from "../../domain/entities/Post";
import { IPostRepository } from "../../domain/interfaces/IPostRepository";
import { PostModel } from "../database/PostModel";

export class PostRepository implements IPostRepository {
  async create(post: Post): Promise<Post> {
    const saved = await new PostModel(post).save();
    return {
      id: saved._id.toString(),
      title: saved.title,
      content: saved.content,
      authorId: saved.authorId,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async findById(id: string): Promise<Post | null> {
    const post = await PostModel.findById(id);
    if (!post) return null;

    return {
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async findAll(): Promise<Post[]> {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    return posts.map((post) => ({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));
  }

  async update(id: string, data: Partial<Pick<Post, "title" | "content">>): Promise<Post | null> {
    const updated = await PostModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return null;

    return {
      id: updated._id.toString(),
      title: updated.title,
      content: updated.content,
      authorId: updated.authorId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await PostModel.findByIdAndDelete(id);
    return result !== null;
  }

  async countAll(): Promise<number> {
    return PostModel.countDocuments();
  }

  async countByAuthor(authorId: string): Promise<number> {
    return PostModel.countDocuments({ authorId });
  }
}
