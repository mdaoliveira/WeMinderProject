import express from "express";
import { getTasks, postTask, deleteTask, editTask, editSubtask } from "../controllers/tasks.js";

const router = express.Router();

router.get("/tarefas", getTasks);
router.post("/tarefas", postTask);
router.delete("/tarefas/:id", deleteTask);
router.put("/tarefas/:id", editTask);
router.put("/subtarefas/:id", editSubtask);

export default router;
