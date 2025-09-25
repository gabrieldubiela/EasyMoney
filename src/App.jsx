import React from 'react';
// Importação do Provider (default export)
import HouseholdProvider from './context/HouseholdContext'; 
// Importação do novo componente de Roteamento
import Routes from './components/Routes'; 
import './App.css'; 

// Componente Principal App (Define o Provedor)
function App() {
  return (
    <HouseholdProvider>
      {/* Todo o roteamento e lógica de Auth foi movido para Routes */}
      <Routes />
    </HouseholdProvider>
  );
}

export default App;