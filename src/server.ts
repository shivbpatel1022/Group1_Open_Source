import express from "express";
import cors from "cors";
import { connectDB } from "./infrastructure/database/mongo";
import { authMiddleware } from "./presentation/middleware/authMiddleware";
import { requestLogger } from "./presentation/middleware/requestLogger";
import authRoutes from "./presentation/routes/authRoutes";
import postRoutes from "./presentation/routes/postRoutes";
import commentRoutes from "./presentation/routes/commentRoutes";
import adminRoutes from "./presentation/routes/adminRoutes";
import { env } from "./config/env";
import { AuthRequest } from "./presentation/types/AuthRequest";
import { logger } from "./infrastructure/logging/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:postId/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

connectDB();

app.get("/", (_req, res) => {
  res.send("Forums API Running");
});

app.get("/protected", authMiddleware, (req: AuthRequest, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

app.listen(env.port, () => {
  logger.info("server_started", { port: env.port });
});
