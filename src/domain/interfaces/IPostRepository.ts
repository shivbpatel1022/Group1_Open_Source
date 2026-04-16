import { Post } from "../entities/Post";

export interface IPostRepository {
  create(post: Post): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findAll(): Promise<Post[]>;
  update(id: string, data: Partial<Pick<Post, "title" | "content">>): Promise<Post | null>;
  delete(id: string): Promise<boolean>;
  countAll(): Promise<number>;
  countByAuthor(authorId: string): Promise<number>;
}
