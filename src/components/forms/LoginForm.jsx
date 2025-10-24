// src/components/forms/LoginForm.jsx


/**
 * Formulário de login de usuário.
 */
import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import "../../styles/forms.css";
import "../../styles/buttons.css";

export default function LoginForm({ onSuccess, onError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const [formError, setFormError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email || !password) {
      setFormError("Informe e-mail e senha.");
      return;
    }
    const ok = await login(email, password);
    if (ok) {
      onSuccess?.("Login realizado!");
    } else {
      setFormError(error || "Falha no login.");
      onError?.(error);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Acessar sua conta</h2>
      <form onSubmit={handleLogin} className="form auth-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="email" className="form-label required">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label required">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            disabled={loading}
          />
        </div>
        {formError && <div className="form-error">{formError}</div>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
