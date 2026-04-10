import { Request, Response } from "express";
import { registerUser } from "../../application/use-cases/auth/registerUser";
import { loginUser } from "../../application/use-cases/auth/loginUser";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
