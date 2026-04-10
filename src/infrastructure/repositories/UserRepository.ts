import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserModel } from "../database/UserModel";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();

    return {
      id: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email,
      password: savedUser.password,
      role: savedUser.role as "user" | "admin",
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });

    if (!user) return null;

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role as "user" | "admin",
    };
  }
}
