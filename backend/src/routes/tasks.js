import express from "express";
import {
  getTasks,
  postTask,
 
  editTask,
  editSubtask, 
   
  getColor,
  updateColor,
  getRelatorioTarefasConcluidas
, getLixeira, enviaLixeira, 
    excluirPermanente, excluirTudoPermanente, 
    restaurarTarefa, restaurarTudo} from "../controllers/tasks.js";

const router = express.Router();

// Tarefas
router.get("/", getTasks);
router.post("/", postTask);
router.delete("/:id", deleteTask);
router.put("/:id", editTask);
router.put("/subtask/:id", editSubtask);

// Cores
router.get("/color/:id", getColor);
router.put("/color/:id", updateColor);

// Relatório
router.get("/relatorio/concluidas", getRelatorioTarefasConcluidas);

export default router;