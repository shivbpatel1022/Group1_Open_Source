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
      role: savedUser.role as User["role"],
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
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
      role: user.role as User["role"],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role as User["role"],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateRole(id: string, role: User["role"]): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: "after" },
    );
    if (!user) return null;

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role as User["role"],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async countAll(): Promise<number> {
    return UserModel.countDocuments();
  }

  async countByRole(role: User["role"]): Promise<number> {
    return UserModel.countDocuments({ role });
  }
}
