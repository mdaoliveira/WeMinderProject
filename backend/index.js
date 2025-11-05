import express from "express"
import taskRoutes from "./src/routes/tasks.js";
import authRoutes from "./src/routes/auth.js";
import cors from "cors";

import dotenv from "dotenv";
// Carrega variáveis do arquivo .env na raiz do backend
dotenv.config();
// Verifica se JWT_SECRET foi definido no .env e encerra antes de montar rotas
if (!process.env.JWT_SECRET) {
	console.error("ERRO: JWT_SECRET não está definido no arquivo .env");
	process.exit(1);
}
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/", taskRoutes);
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));