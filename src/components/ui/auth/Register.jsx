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
    <div>
      <h2>Criar uma nova conta</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Primeiro Nome"
          required
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Sobrenome"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
        />
        <input
          type="text"
          value={householdIdInput}
          onChange={(e) => setHouseholdIdInput(e.target.value)}
          placeholder="ID de Família Existente (Opcional)"
        />
        {!householdIdInput && (
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Nome da sua Família (ex: Casa Silva)"
          />
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;