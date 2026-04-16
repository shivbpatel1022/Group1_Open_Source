import { Response } from "express";
import { getAdminStats } from "../../application/use-cases/admin/getAdminStats";
import { AuthRequest } from "../types/AuthRequest";
import { updateUserRole } from "../../application/use-cases/admin/updateUserRole";
import { User } from "../../domain/entities/User";

export const getAdminStatsController = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const stats = await getAdminStats();
  return res.status(200).json(stats);
};

export const updateUserRoleController = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.body.role as User["role"];
    if (!["user", "admin", "super"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await updateUserRole(String(req.params.userId), role);
    return res.status(200).json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      role: updated.role,
      updatedAt: updated.updatedAt,
    });
  } catch (error: unknown) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update role" });
  }
};
