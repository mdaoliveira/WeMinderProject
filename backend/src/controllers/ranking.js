import { db } from "../database/db.js";

export const getRanking = (req, res) => {
    const qRanking = `
        SELECT id, nome, email, pontuacao 
        FROM usuarios 
        ORDER BY pontuacao DESC, nome ASC
    `;

    db.query(qRanking, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao buscar ranking", error: err });
        }
        return res.status(200).json(results);
    });
};

