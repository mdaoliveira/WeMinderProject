import express from "express";
import { getTasks, postTask, updateColor, getColor, getLixeira, enviaLixeira, 
    excluirPermanente, excluirTudoPermanente, restaurarTarefa, restaurarTudo} from "../Controllers/tasks.js";

const router = express.Router();

router.get("/tarefas", getTasks);
router.post("/tarefas", postTask);
// router.put("/tarefas/:id", putTask);
router.get("/color", getColor);
router.put("/color", updateColor);
router.get("/lixeira", getLixeira);
router.put("/lixeira/:id", enviaLixeira);
router.delete("/excluir/:id", excluirPermanente);
router.delete("/excluirTudo/", excluirTudoPermanente);
router.put("/restaurar/:id", restaurarTarefa);
router.put("/restaurarTudo/", restaurarTudo);   

export default router;