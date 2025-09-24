import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect para "escutar" o estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpa o observador quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logout efetuado com sucesso!');
    } catch (error) {
      console.error('Erro ao sair:', error.message);
    }
  };

  // Se a página ainda estiver carregando, mostra uma tela de carregamento
   if (loading) {
    return <div className="App">Carregando...</div>;
  }

  // Se um usuário estiver logado, mostra o Dashboard
  if (user) {
    return (
      <div className="App">
        <button onClick={handleLogout}>Sair</button>
        <Dashboard />
      </div>
    );
  }

  // Se nenhum usuário estiver logado, mostra o Login
  return (
    <div className="App">
      <Login />
    </div>
  );
}

export default App;