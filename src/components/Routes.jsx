// src/routes/Routes.jsx (Refatorado)

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useHousehold } from '../context/useHousehold';

// Importação dinâmica (Code Splitting) de todas as páginas
const AuthPage = lazy(() => import('../pages/AuthPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
// NOVAS ROTAS
const ExpenseListPage = lazy(() => import('../pages/ExpenseListPage'));
const MonthlyBalancePage = lazy(() => import('../pages/MonthlyBalancePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage')); 
// O componente 'pages' precisa ser acessado corretamente dependendo da sua estrutura de pastas

// --- Componente de Layout (Menu de Navegação Simulado) ---
const NavMenu = ({ handleLogout, householdName }) => (
    <nav style={{ padding: '10px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard ({householdName})</Link>
            <Link to="/expenses" style={{ color: 'white', textDecoration: 'none' }}>Lista de Despesas</Link>
            <Link to="/balance" style={{ color: 'white', textDecoration: 'none' }}>Balanço Mensal</Link>
            <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>Configurações</Link>
        </div>
        <button 
            onClick={handleLogout} 
            style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
        >
            Sair
        </button>
    </nav>
);

// --- Componente Principal de Roteamento ---
const AppRoutes = () => {
    // Pegamos o estado do usuário e o householdId para proteção de rotas e dados
    const { user, isLoading, householdId } = useHousehold(); 
    
    // O nome da Household que carregamos no Context
    const householdName = householdId ? `ID: ${householdId.substring(0, 4)}...` : 'Sem Casa'; 

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

    // 1. Rota Protegida (HOC Simulado)
    // Este componente garante que o usuário esteja logado
    const ProtectedRoute = ({ children }) => {
        if (!user) {
            // Se não logado, redireciona para a página de login
            return <Navigate to="/login" replace />;
        }
        // A segurança contra cópia de URL de outra família é garantida *automaticamente*
        // pelos hooks de Firestore que usam o 'householdId' do contexto. Se o ID
        // não bate com o doc do usuário, os dados simplesmente não carregam (erro 403).
        return children;
    };


    // 2. Rota de Autenticação (Redirecionamento para o Dashboard se já logado)
    const AuthRoute = ({ children }) => {
        if (user) {
            // Se já logado, redireciona para o Dashboard
            return <Navigate to="/" replace />;
        }
        return children;
    };


    return (
        <BrowserRouter>
            {user && <NavMenu handleLogout={handleLogout} householdName={householdName} />}
            
            <Suspense fallback={<div style={{ padding: '20px' }}>Carregando página...</div>}>
                <RouterRoutes>
                    
                    {/* Rotas Públicas (Auth) */}
                    <Route 
                        path="/login" 
                        element={
                            <AuthRoute><AuthPage /></AuthRoute>
                        } 
                    />
                    
                    {/* Rotas Protegidas */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute><DashboardPage /></ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/expenses" 
                        element={
                            <ProtectedRoute><ExpenseListPage /></ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/balance" 
                        element={
                            <ProtectedRoute><MonthlyBalancePage /></ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/settings" 
                        element={
                            <ProtectedRoute><SettingsPage /></ProtectedRoute>
                        } 
                    />

                    {/* Rota Padrão (Redireciona qualquer URL desconhecida para o login) */}
                    <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
                    
                </RouterRoutes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRoutes;