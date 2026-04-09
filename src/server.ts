import {connectDB} from "././infrastructure/database/mongo"
import express from "express";

const app = express();
app.use(express.json());
connectDB();

app.get("/", (req, res) => {
  res.send("Forums API Running 🚀");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});