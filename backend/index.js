import express from "express"
import taskRoutes from "./src/routes/tasks.js";
import authRoutes from "./src/routes/auth.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/", taskRoutes);
app.listen(8800);