// src/components/ui/auth/Register.jsx

import React, { useState } from 'react';
import { registerUserAndHandleHousehold } from '../../services/registerService';

const Register = () => {
  const [name, setname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [householdIdInput, setHouseholdIdInput] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await registerUserAndHandleHousehold({
        email,
        password,
        name,
        householdId: householdIdInput,
        familyName,
      });

      setSuccess('Usuário registrado com sucesso!');

      setname('');
      setEmail('');
      setPassword('');
      setHouseholdIdInput('');
      setFamilyName('');

    } catch (firebaseError) {
      setError(firebaseError.message);
      console.error('Erro ao registrar:', firebaseError.message);
    } finally {
      setLoading(false);
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
            onChange={(e) => setname(e.target.value)}
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
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
};

export default Register;