import { Request, Response } from "express";
import { registerUser } from "../../application/use-cases/auth/registerUser";
import { loginUser } from "../../application/use-cases/auth/loginUser";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.status(200).json({
      token: result.token,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
