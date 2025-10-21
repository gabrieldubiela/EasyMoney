// src/pages/DashboardPage.jsx

import React from 'react';

// Remover todas as importações de Hooks e componentes complexos.
// import { useAppContext } from '../context/useAppContext'; 

const DashboardPage = () => {
    // 🛑 SEM CHAMDAS DE HOOKS 🛑

    // Não há estado de carregamento, ela é instantânea.
    
    return (
        <div className="container container-sm">
            <div className="card text-center">
                <h1 className="page-title">Bem-vindo(a)!</h1>

                <p className="text-lg mt-lg">
                    Use o menu de navegação acima para acessar as áreas funcionais da aplicação.
                </p>

                <p className="mt-md text-muted">
                    Este painel serve apenas como ponto de partida.
                </p>
            </div>
        </div>
    );
};

export default DashboardPage;