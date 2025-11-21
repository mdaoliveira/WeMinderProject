import express from "express";
import {
  getTasks,
  postTask,
  editTask,
  editSubtask, 
  getColor,
  updateColor,
  getRelatorioTarefasConcluidas, 
  getLixeira, 
  enviaLixeira, 
  excluirPermanente, 
  excluirTudoPermanente, 
  restaurarTarefa, 
  restaurarTudo} from "../controllers/tasks.js";

const router = express.Router();

// Tarefas
router.get("/", getTasks);
router.post("/", postTask);
router.put("/:id", editTask);
router.put("/subtask/:id", editSubtask);
// Cores
router.get("/color/:id", getColor);
router.put("/color/:id", updateColor);
// Relatório
router.get("/relatorio/concluidas", getRelatorioTarefasConcluidas);
// Lixeira
router.get("/lixeira", getLixeira);
router.put("/lixeira/:id", enviaLixeira);
router.delete("/excluir/:id", excluirPermanente);
router.delete("/excluirTudo/", excluirTudoPermanente);
router.put("/restaurar/:id", restaurarTarefa);
router.put("/restaurarTudo/", restaurarTudo);

export default router;