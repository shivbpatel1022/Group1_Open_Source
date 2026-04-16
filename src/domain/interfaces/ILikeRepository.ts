export interface ILikeRepository {
  exists(postId: string, userId: string): Promise<boolean>;
  create(postId: string, userId: string): Promise<void>;
  delete(postId: string, userId: string): Promise<void>;
  countByPost(postId: string): Promise<number>;
  countAll(): Promise<number>;
}
