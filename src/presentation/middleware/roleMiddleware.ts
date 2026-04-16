import { NextFunction, Response } from "express";
import { User } from "../../domain/entities/User";
import { AuthRequest } from "../types/AuthRequest";

export const allowRoles = (roles: User["role"][]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

export const isAdmin = allowRoles(["admin", "super"]);
export const isSuperUser = allowRoles(["super"]);
