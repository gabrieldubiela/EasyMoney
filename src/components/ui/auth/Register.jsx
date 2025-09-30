// src/components/ui/auth/Register.jsx

import React, { useState } from 'react';
// IMPORTANTE: Agora importamos nosso serviço e não mais as funções do Firebase diretamente!
import { registerUserAndHandleHousehold } from '../../../services/authService';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      // A mágica acontece aqui! O componente não sabe mais os detalhes.
      // Ele apenas entrega os dados para o serviço e espera uma resposta.
      await registerUserAndHandleHousehold({
        email,
        password,
        firstName,
        lastName,
        householdId: householdIdInput,
        familyName,
      });

      // Se a função acima não lançar um erro, significa que tudo deu certo.
      setSuccess('Usuário registrado com sucesso! Você já pode fazer o login.');

      // Opcional: Limpar o formulário após o sucesso
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setHouseholdIdInput('');
      setFamilyName('');

    } catch (firebaseError) {
      // Se o serviço lançar um erro, nós o capturamos aqui para mostrar na tela.
      setError(firebaseError.message);
      console.error('Erro ao registrar:', firebaseError.message);
    } finally {
      // Independentemente de sucesso ou falha, paramos o loading.
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Criar uma nova conta</h2>
      {success && <p className="auth-success">{success}</p>}
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Primeiro Nome"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Sobrenome"
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
              placeholder="Nome da sua Família (ex: Casa Silva)"
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