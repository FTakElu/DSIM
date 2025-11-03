import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import api from "../service/api";
import theme from "../styles/Theme.module.css";

const CadastroUsuarioPage: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string>("");

  const handleRegister = async () => {
    setMsg("");
    try {
      await api.post("/api/auth/register", { nome, email, senha });
      setMsg("Usuário cadastrado! Você já pode fazer login.");
      setNome("");
      setEmail("");
      setSenha("");
    } catch (e: any) {
      setMsg("Erro ao cadastrar: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <PageShell
      title="Cadastro de Usuário"
      subtitle="Crie sua conta de Administrador"
    >
      <div className={theme.card} style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className={theme.field}>
          <label>Nome</label>
          <input
            className={theme.input}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
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
            placeholder="Crie uma senha"
          />
        </div>

        <button
          className={`${theme.btn} ${theme.primary}`}
          onClick={handleRegister}
          style={{ width: "100%" }}
        >
          Cadastrar
        </button>
        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        <div style={{ marginTop: 12 }}>
          <Link to="/login">Já tem conta? Entrar</Link>
        </div>
      </div>
    </PageShell>
  );
};

export default CadastroUsuarioPage;
