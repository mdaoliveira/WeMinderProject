import express from "express";
import { getTasks } from "../Controllers/tasks.js";

const router = express.Router();

router.get("/tarefas", getTasks);
// router.post("/", postTasks);
// router.delete("/:id", deleteTasks);
// router.put("/:id", putTasks);

export default router;