import { Request } from "express";
import { User } from "../../domain/entities/User";

export interface AuthUserPayload {
  userId: string;
  role: User["role"];
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}
