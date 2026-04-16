import { Comment } from "../entities/Comment";

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByPostId(postId: string): Promise<Comment[]>;
  update(id: string, content: string): Promise<Comment | null>;
  delete(id: string): Promise<boolean>;
  countAll(): Promise<number>;
  countByAuthor(authorId: string): Promise<number>;
}
