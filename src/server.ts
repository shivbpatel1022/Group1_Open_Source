import { connectDB } from "./infrastructure/database/mongo";
import express from "express";
import { authMiddleware } from "./presentation/middleware/authMiddleware";
import authRoutes from "./presentation/routes/authRoutes";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
connectDB();

app.get("/", (req, res) => {
  res.send("Forums API Running 🚀");
});

app.get("/protected", authMiddleware, (req: any, res) => {
  res.json({
    message: "You accessed protected route 🎉",
    user: req.user,
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
