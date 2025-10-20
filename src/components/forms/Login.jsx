import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login realizado com sucesso.');

    } catch (firebaseError) {
      setError(firebaseError.message);
      console.error('Erro ao fazer login:', firebaseError.message);
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
        <button type="submit" className="primary">Entrar</button>
      </form>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
};

export default Login;