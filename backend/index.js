import express from "express"
import taskRoutes from "./Routes/tasks.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/", taskRoutes);
app.listen(8800);