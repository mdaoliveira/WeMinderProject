import express from "express";
import authRoutes from "./src/routes/auth.js";
import cors from "cors";
import tasksRouter from "./src/routes/tasks.js";

import dotenv from "dotenv";
// Carrega variáveis do arquivo .env na raiz do backend
dotenv.config();
// Verifica se JWT_SECRET foi definido no .env e encerra antes de montar rotas
if (!process.env.JWT_SECRET) {
	console.error("ERRO: JWT_SECRET não está definido no arquivo .env");
	process.exit(1);
}
const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/tarefas", tasksRouter);
app.use("/color", tasksRouter);

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`), () => {
    console.log("Backend rodando na porta 8800");
});
