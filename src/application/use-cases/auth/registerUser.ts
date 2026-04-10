import bcrypt from "bcrypt";
import { UserRepository } from "../../../infrastructure/repositories/UserRepository";

const userRepo = new UserRepository();

export const registerUser = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await userRepo.create({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    role: "user",
  });
};
