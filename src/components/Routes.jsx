import React, { lazy, Suspense } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useHousehold } from '../context/useHousehold';
// Importação dinâmica (Code Splitting):
const Dashboard = lazy(() => import('./Dashboard'));
const AuthPage = lazy(() => import('./AuthPage'));


const Routes = () => {
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
      return <div className="App">Carregando informações do sistema...</div>;
  }

  // Se o usuário está logado, mostra o Dashboard
  if (user) {
    return (
      <div className="App">
        <button onClick={handleLogout}>Sair</button>
        {/* Usamos Suspense para mostrar um fallback enquanto o Dashboard é carregado */}
        <Suspense fallback={<div>Carregando Dashboard...</div>}>
          <Dashboard />
        </Suspense>
      </div>
    );
  }

  // Se o usuário não está logado, mostra o AuthPage
  return (
    <div className="App">
      <Suspense fallback={<div>Carregando Formulário...</div>}>
        <AuthPage />
      </Suspense>
    </div>
  );
};

export default Routes;