import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import "../../App.css";
const SignupAndLogin = () => {
  const [formMode, setFormMode] = useState("Sign Up");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  //if (showForgotPassword) {
    //return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
  //}
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email e senha são obrigatórios!");
      return false;
    }

    if (formMode === "Sign Up" && !formData.username) {
      setError("Username é obrigatório!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email inválido! Por favor, insira um e-mail válido.");
      return false;
    }

    if (formData.password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const endpoint = formMode === "Sign Up" ? "/api/auth/signup" : "/api/auth/login";
    const url = `http://localhost:8800${endpoint}`;

    console.log("Enviando para:", url, "payload:", formData);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    // tenta parsear JSON, mas aceita texto se não for JSON
    let data;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      data = { message: text };
    }

    console.log("Resposta do servidor:", response.status, data);

    if (!response.ok) {
      // monta mensagem de erro mais informativa
      const serverMsg = data?.message || data?.error || text || `Erro ${response.status}`;
      throw new Error(serverMsg);
    }

    // se chegou aqui, ok
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
    }

    setSuccess(formMode === "Sign Up" ? "Cadastro realizado com sucesso!" : "Login realizado com sucesso!");
    //setTimeout(() => (window.location.href = "/dashboard"), 1500);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
}

    setSuccess("Login realizado com sucesso!");
    setTimeout(() => navigate("/dashboard"), 1000);

  } catch (err) {
    console.error("Erro em handleSubmit:", err);
    setError(err.message || "Erro desconhecido ao conectar com o servidor");
  } finally {
    setLoading(false);
  }
};

  const switchMode = (mode) => {
    setFormMode(mode);
    setError("");
    setSuccess("");
    setFormData({ username: "", email: "", password: "" });
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className="App">
      <div className="content">
        <div
          className="task_box-login-singup">
          <div className="logo-singup-login">
            <img  
              src="/images/logo.png"
              alt="Logo" />
          </div>
          <h2 className="h2-login-signup">{formMode}</h2>
          <div className="underline-login-signup"></div>
        
          {formMode === "Login" ? null : (
            <div className="input-login-signup">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          )}

          <div className="input-login-signup">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="text"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-login-signup">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>


          {formMode === "Sign Up" ? null : (
            <div className="forgot-password" >
              Esqueceu sua senha?{" "}
              <span className="forgot-password-click"
                onClick={handleForgotPassword}
              >
                Clique aqui
              </span>
            </div>
          )}
          {error && (
            <div
              className="error-message">
              {error}
            </div>
          )}
          {success && (
            <div
              className="success-message">
              {success}
            </div>
          )}

          <div className="button-content-login">
            <button
              onClick={handleSubmit} className={loading ? "loading" : ""}>
              {loading
                ? "Aguarde..."
                : formMode === "Sign Up"
                ? "Cadastrar"
                : "Entrar"}
            </button>
            <button
              className="gray"
              onClick={() =>
                switchMode(formMode === "Sign Up" ? "Login" : "Sign Up")
              }
            >
              {formMode === "Sign Up" ? "Ir para Login" : "Criar Conta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupAndLogin;