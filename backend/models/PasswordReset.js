import {db} from "../db.js";

export const createResetToken = (userId, token, expiresAt) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
        db.query(query, [userId, token, expiresAt], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
};

export const findValidToken = (token) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        prt.id,
        prt.user_id,
        prt.token,
        prt.expires_at,
        prt.used,
        u.email,
        u.username
      FROM password_reset_tokens prt
      INNER JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ? 
        AND prt.used = 0
        AND prt.expires_at > NOW()
      LIMIT 1
    `;
    
    db.query(query, [token], (err, data) => {
      if (err) {
        console.error("Erro ao buscar token:", err);
        return reject(err);
      }
      
      // Se não encontrou resultado
      if (!data || data.length === 0) {
        console.log("Token não encontrado, expirado ou já usado");
        return resolve(null);
      }
      
      const result = data[0];
      console.log("Token encontrado:", {
        user_id: result.user_id,
        email: result.email,
        expires_at: result.expires_at,
        used: result.used
      });
      
      resolve(result);
    });
  });
};

export const markTokenAsUsed = (token) => {
    return new Promise((resolve, reject) => {
        const query = "UPDATE password_reset_tokens SET used = TRUE WHERE token = ?";
        db.query(query, [token], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


export const deleteUserTokens = (userId) => {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM password_reset_tokens WHERE user_id = ?";
        db.query(query, [userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
