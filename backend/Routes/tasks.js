import express from "express";
import { getTasks, postTask, deleteTask, editTask} from "../Controllers/tasks.js";

const router = express.Router();

router.get("/tarefas", getTasks);
router.post("/tarefas", postTask);
router.delete("/tarefas/:id", deleteTask);
router.put("/tarefas/:id", editTask);

export default router;