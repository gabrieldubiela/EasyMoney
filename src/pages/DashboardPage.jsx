// src/pages/DashboardPage.jsx

import React from 'react';

// Remover todas as importações de Hooks e componentes complexos.
// import { useHousehold } from '../hooks/useHousehold'; 

const DashboardPage = () => {
    // 🛑 SEM CHAMDAS DE HOOKS 🛑

    // Não há estado de carregamento, ela é instantânea.
    
    return (
        <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            maxWidth: '600px', 
            margin: '0 auto',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
        }}>
            
            <h1 style={{ color: '#007bff' }}>Bem-vindo(a)!</h1>

            <p style={{ fontSize: '1.1em', marginTop: '20px', color: '#333' }}>
                Use o menu de navegação acima para acessar as áreas funcionais da aplicação.
            </p>
            
            <p style={{ marginTop: '15px', color: '#666' }}>
                Este painel serve apenas como ponto de partida.
            </p>
        </div>
    );
};

export default DashboardPage;