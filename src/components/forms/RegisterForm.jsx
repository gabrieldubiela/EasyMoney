// src/components/forms/RegisterForm.jsx


import React, { useState } from "react";
import useRegister from "../../hooks/useRegister";
import "../../styles/forms.css";
import "../../styles/buttons.css";

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
  const [formError, setFormError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim() || !email.trim() || !password) {
      setFormError("Preencha os campos obrigatórios.");
      return;
    }
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
      {success && <p className="form-success">{success}</p>}
      {(error || formError) && <p className="form-error">{formError || error}</p>}
      <form onSubmit={handleRegister} className="form auth-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="register-name" className="form-label required">
            Nome
          </label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-email" className="form-label required">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password" className="form-label required">
            Senha
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-household" className="form-label">
            ID de Família Existente <span className="form-info">(Opcional)</span>
          </label>
          <input
            id="register-household"
            type="text"
            value={householdIdInput}
            onChange={(e) => setHouseholdIdInput(e.target.value)}
            placeholder="ID de Família Existente"
            disabled={loading}
          />
        </div>
        {!householdIdInput && (
          <div className="form-group">
            <label htmlFor="register-familyname" className="form-label">
              Nome da sua Família (opcional)
            </label>
            <input
              id="register-familyname"
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Nome da sua Família (ex: Silva)"
              disabled={loading}
            />
          </div>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
