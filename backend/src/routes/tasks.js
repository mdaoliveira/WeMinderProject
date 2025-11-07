import express from "express";
import { getTasks, postTask, deleteTask, editTask, updateColor, getColor} from "../controllers/tasks.js";
const router = express.Router();

router.get("/tarefas", getTasks);
router.post("/tarefas", postTask);
router.delete("/tarefas/:id", deleteTask);
router.put("/tarefas/:id", editTask);
router.get("/color", getColor);
router.put("/color", updateColor);

export default router;
