// src/pages/AdminDashboardPage.jsx (CORRIGIDO)

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import UserManagement from '../components/domains/UserManagement';
import HouseholdManagement from '../components/domains/HouseholdManagement'; 
import DataManagement from '../components/domains/DataManagement'; 

const AdminDashboardPage = () => {
    const { user, loading: userLoading } = useAppContext();
    const [activeTab, setActiveTab] = useState('users');

    // Lógica de Autorização (Mantida)
    if (userLoading) {
        return <div>Carregando perfil de usuário...</div>;
    }
    
    const isAdmin = user && user.isAdmin === true; 

    if (!isAdmin) {
        return (
            <div>
                <h2>Acesso Não Autorizado</h2>
                <p>Você não tem permissão de administrador para acessar esta página.</p>
            </div>
        );
    }
    
    // Função auxiliar para renderizar o conteúdo da aba (Mantida)
    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'households':
                return <HouseholdManagement />;
            case 'data':
                return <DataManagement />;
            default:
                return <div>Selecione uma opção no menu.</div>;
        }
    };

    return (
        <div>
            <h1>Painel de Administração</h1>
            
            {/* Menu de Navegação (Tabs) */}
            <div className="admin-tabs">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={activeTab === 'users' ? 'active' : ''}
                >
                    Gestão de Usuários
                </button>
                <button 
                    onClick={() => setActiveTab('households')}
                    className={activeTab === 'households' ? 'active' : ''}
                >
                    Gestão de Famílias
                </button>
                <button 
                    onClick={() => setActiveTab('data')}
                    className={activeTab === 'data' ? 'active' : ''}
                >
                    Manutenção de Dados
                </button>
            </div>
            
            {/* Conteúdo da Aba Ativa */}
            <div className="admin-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboardPage;