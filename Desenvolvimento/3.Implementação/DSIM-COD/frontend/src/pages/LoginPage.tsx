import React, { useState } from "react";
import PageShell from "../components/PageShell";
import api from "../service/api";
import theme from "../styles/Theme.module.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/auth/login", { email, senha });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      // Redireciona conforme cargo
      window.location.href = "/pacientes";
    } catch (e: any) {
      setError("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Entrar" subtitle="Acesse sua conta para continuar">
      <div className={theme.card} style={{ maxWidth: 420, margin: "0 auto" }}>
        <div className={theme.field}>
          <label>Email</label>
          <input
            className={theme.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>
        <div className={theme.field}>
          <label>Senha</label>
          <input
            className={theme.input}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          className={`${theme.btn} ${theme.primary}`}
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%" }}
        >
          Entrar
        </button>
        {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
        <div style={{ marginTop: 12 }}>
          <a href="/cadastro">Não tem conta? Cadastre-se</a>
        </div>
      </div>
    </PageShell>
  );
};

export default LoginPage;
