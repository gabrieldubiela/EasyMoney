// src/components/forms/RegisterForm.jsx

import React, { useState } from "react";
import useRegister from "../../hooks/useRegister";

/**
 * Formulário de registro com opção de família nova ou vínculo a já existente.
 */
export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [householdIdInput, setHouseholdIdInput] = useState("");
  const [familyName, setFamilyName] = useState("");
  const { register, loading, error, success } = useRegister();

  const handleRegister = async (e) => {
    e.preventDefault();
    const ok = await register({
      email,
      password,
      name,
      householdId: householdIdInput,
      familyName,
    });
    if (ok) {
      setName("");
      setEmail("");
      setPassword("");
      setHouseholdIdInput("");
      setFamilyName("");
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Criar nova conta</h2>
      {success && <p className="auth-success">{success}</p>}
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={householdIdInput}
            onChange={(e) => setHouseholdIdInput(e.target.value)}
            placeholder="ID de Família Existente (Opcional)"
          />
        </div>
        {!householdIdInput && (
          <div className="form-group">
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Nome da sua Família (ex: Silva)"
            />
          </div>
        )}
        <button type="submit" disabled={loading} className="primary">
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
