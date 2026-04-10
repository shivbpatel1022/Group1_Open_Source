import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied (admin only)" });
  }

  next();
};
