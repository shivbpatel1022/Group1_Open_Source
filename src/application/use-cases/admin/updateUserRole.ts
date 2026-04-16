import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../infrastructure/repositories/UserRepository";

const userRepo = new UserRepository();

export const updateUserRole = async (userId: string, role: User["role"]) => {
  const updated = await userRepo.updateRole(userId, role);
  if (!updated) {
    throw new Error("User not found");
  }
  return updated;
};
