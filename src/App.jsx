// src/App.jsx

import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
// ATUALIZADO: Importa o Provider e o Hook de seus novos locais
import { HouseholdProvider } from './context/HouseholdContext'; 
import { useHousehold } from './context/useHousehold'; 
// Componentes
import Login from './components/Login';
import Register from './components/Register'; 
import Dashboard from './components/Dashboard';
import './App.css';

// Componente de Conteúdo/Roteamento (sem alterações na lógica)
function AppContent() {
  const { user, isLoading } = useHousehold(); 
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logout efetuado com sucesso!');
    } catch (error) {
      console.error('Erro ao sair:', error.message);
    }
  };

  if (isLoading) {
      return <div className="App">Carregando...</div>;
  }

  if (user) {
    return (
      <div className="App">
        <button onClick={handleLogout}>Sair</button>
        <Dashboard />
      </div>
    );
  }

  return (
    <div className="App">
      <AuthPage />
    </div>
  );
}

// Componente Principal App (Define o Provedor)
function App() {
  return (
    <HouseholdProvider>
      <AppContent />
    </HouseholdProvider>
  );
}

export default App;