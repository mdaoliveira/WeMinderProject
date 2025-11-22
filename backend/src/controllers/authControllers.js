import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../db.js";
import { findByEmail } from "../../user.js";
import crypto from "crypto";
import { createResetToken, findValidToken, markTokenAsUsed, deleteUserTokens } from "../../models/PasswordReset.js";
import { sendPasswordResetEmail } from "../../services/emailService.js";

// Função para registrar usuário
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validação básica
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    // Verifica se o e-mail já existe
    const users = await findByEmail(email);
    if (users.length > 0) {
      return res.status(409).json({ message: "Usuário já existe!" });
    }

    // Criptografa senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insere no banco
    const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    
    db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Erro ao criar usuário:", err);
        return res.status(500).json({ message: "Erro ao criar usuário", error: err.message });
      }
      
      return res.status(201).json({ 
        message: "Usuário criado com sucesso!",
        userId: result.insertId 
      });
    });

  } catch (err) {
    console.error("Erro no signup:", err);
    return res.status(500).json({ message: "Erro interno no servidor", error: err.message });
  }
};

// Função para login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    // 1. Busca usuário no banco
    const users = await findByEmail(email);
    if (!users.length) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    const user = users[0];

    // 2. Compara senha digitada com hash no banco
    const senhaCorreta = await bcrypt.compare(password, user.password);
    
    if (!senhaCorreta) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    // 3. Gera token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token válido por 7 dias
    );

    // Remove senha do objeto user antes de enviar
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      message: "Login realizado com sucesso!", 
      token,
      user: userWithoutPassword
    });

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro interno no servidor", error: err.message });
  }
};

// Solicitar recuperação de senha
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if(!email) {
      return res.status(400).json({ message: "Email é obrigatório" });
    }

    // verificar se o usuário existe
    const users = await findByEmail(email);

    // por segurança, sempre retorna sucesso (não revela se e-mail existe)
    if(!users.length) {
      return res.json({message: "Se o e-mail existir, você receberá instruções de recuperação." });
    }

    const user = users[0];

    // gerar token único e seguro
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // detela os tokens antigos do usuário
    await deleteUserTokens(user.id);

    // criar novo token
    await createResetToken(user.id, resetToken, expiresAt);

    // enviar e-mail para o usuário de recuperação de senha
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if(!emailSent) {
      return res.status(500).json({ message: "Erro ao enviar e-mail de recuperação de senha" });
    }

    res.json({ message: "E-mail de recuperação de senha enviado com sucesso!" });
  }catch (err) {
    console.error("Erro ao solicitar recuperação de senha:", err);
    res.status(500).json({message: "Erro interno no servidor"});
  }
};



// Validar token de recuperação
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        valid: false, 
        message: "Token não fornecido" 
      });
    }

    // Valida token
    const resetData = await findValidToken(token);

    if (!resetData) {
      return res.status(400).json({ 
        valid: false, 
        message: "Token inválido ou expirado. Solicite um novo link de recuperação." 
      });
    }

    // Token válido
    res.json({ 
      valid: true, 
      message: "Token válido",
      email: resetData.email // opcional: mostrar o email ao usuário
    });

  } catch (err) {
    console.error("Erro ao validar token:", err);
    res.status(500).json({ 
      valid: false,
      message: "Erro ao validar token. Tente novamente mais tarde." 
    });
  }
};

// Redefinir senha
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validação de entrada
    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: "Token e nova senha são obrigatórios" 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: "A senha deve ter no mínimo 8 caracteres" 
      });
    }

    // CRÍTICO: Valida token ANTES de qualquer operação
    const resetData = await findValidToken(token);

    // Se token não existe, está expirado ou já foi usado
    if (!resetData) {
      console.log("Token inválido ou expirado:", token);
      return res.status(400).json({ 
        message: "Token inválido ou expirado. Solicite um novo link de recuperação." 
      });
    }

    console.log("Token válido para usuário:", resetData.user_id);

    // Criptografa nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualiza senha no banco
    const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
    
    db.query(updateQuery, [hashedPassword, resetData.user_id], async (err, result) => {
      if (err) {
        console.error("Erro ao atualizar senha:", err);
        return res.status(500).json({ 
          message: "Erro ao atualizar senha. Tente novamente mais tarde." 
        });
      }

      // Verifica se a senha foi realmente atualizada
      if (result.affectedRows === 0) {
        console.error("Nenhuma linha afetada ao atualizar senha");
        return res.status(500).json({ 
          message: "Erro ao atualizar senha. Token expirado ou já usado." 
        });
      }

      console.log("Senha atualizada com sucesso para usuário:", resetData.user_id);

      // Marca token como usado SOMENTE após sucesso
      try {
        await markTokenAsUsed(token);
        console.log("Token marcado como usado:", token);
      } catch (markErr) {
        console.error("Erro ao marcar token como usado:", markErr);
        // Não retorna erro aqui pois a senha já foi atualizada com sucesso
      }

      // Retorna sucesso
      return res.status(200).json({ 
        message: "Senha redefinida com sucesso!" 
      });
    });

  } catch (err) {
    console.error("Erro ao redefinir senha:", err);
    return res.status(500).json({ 
      message: "Erro ao processar solicitação. Tente novamente mais tarde." 
    });
  }
};
