import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../../infrastructure/repositories/UserRepository";
import { env } from "../../../config/env";

const userRepo = new UserRepository();

export const loginUser = async (email: string, password: string) => {
  const user = await userRepo.findByEmail(email);

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  const token = jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: "1d",
  });

  return { user, token };
};
