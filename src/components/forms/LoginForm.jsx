import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";

export default function LoginForm({ onSuccess, onError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      onSuccess?.("Login realizado!");
    } else {
      onError?.(error);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Acessar sua conta</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
