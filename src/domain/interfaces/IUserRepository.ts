import { User } from "../entities/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateRole(id: string, role: User["role"]): Promise<User | null>;
  countAll(): Promise<number>;
  countByRole(role: User["role"]): Promise<number>;
}
