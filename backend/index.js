import express from "express";
import taskRoutes from "./src/routes/tasks.js";
import rankingRoutes from "./src/routes/ranking.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/", taskRoutes);
app.use("/", rankingRoutes);
app.listen(8800);
