import express from "express";
import cors from "cors";
import tasksRouter from "./src/routes/tasks.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/tarefas", tasksRouter);
app.use("/color", tasksRouter);

app.listen(8800, () => {
    console.log("Backend rodando na porta 8800");
});
