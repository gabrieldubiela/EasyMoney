// src/routes/Routes.jsx

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';

// Componentes UI
const Nav = lazy(() => import('../components/layout/Nav'));

// Páginas
const AuthPage = lazy(() => import('./AuthPage'));
const DashboardPage = lazy(() => import('./DashboardPage'));
const UsersPage = lazy(() => import('./UsersPage'));
const MonthlyBalancePage = lazy(() => import('./MonthlyBalancePage'));
const TransactionsPage = lazy(() => import('./TransactionsPage'));
const AdminPage = lazy(() => import('./AdminPage'));
const BudgetsPage = lazy(() => import('./BudgetsPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const EditTransactionPage = lazy(() => import('./EditTransactionPage'));
// -----------------------------------------------------------------------------------

// --- Componente de Proteção de Rotas ---

// 1. Rota Protegida Comum (Usuário Logado)
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAppContext();
    if (loading) return <div className="app-loading">Carregando usuário...</div>;
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// 2. Rota de Administração (Usuário Admin)
const AdminRoute = ({ children }) => {
    const { user, loading } = useAppContext();
    if (loading) return <div className="app-loading">Carregando autorização...</div>;
    
    // Se não estiver logado OU não for admin, volta para a dashboard
    if (!user || !user.isAdmin) { 
        return <Navigate to="/" replace />;
    }
    return children;
};

// 3. Rota de Autenticação (Redirecionamento se já logado)
const AuthRoute = ({ children }) => {
    const { user } = useAppContext();
    if (user) {
        return <Navigate to="/" replace />;
    }
    return children;
};


// --- Componente Principal de Roteamento ---
const AppRoutes = () => {
    // Usaremos apenas o 'user' e 'isLoading' para o roteamento inicial
    const { user, loading } = useAppContext(); 

    if (loading) {
        return <div className="App">Carregando informações do sistema...</div>;
    }

    return (
        <BrowserRouter>
            {/* O componente Nav será renderizado somente se o usuário estiver logado */}
            {user && <Nav />} 
            
            <Suspense fallback={<div className="page-loading-fallback">Carregando página...</div>}>
                <RouterRoutes>
                    
                    {/* Rotas Públicas (Auth) */}
                    <Route 
                        path="/login" 
                        element={<AuthRoute><AuthPage /></AuthRoute>} 
                    />
                    
                    {/* Rotas Protegidas (Membros Comuns e Admins) */}
                    <Route 
                        path="/" 
                        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/monthly-balance" 
                        element={<ProtectedRoute><MonthlyBalancePage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/transactions" 
                        element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} 
                    />
                    {/* Rota para Lançamentos/Lista (usando /transactions como principal) */}
                    <Route 
                        path="/transaction/edit/:id" 
                        element={<ProtectedRoute><EditTransactionPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/budgets" 
                        element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/user" 
                        element={<ProtectedRoute><UsersPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/settings" 
                        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} 
                    />

                    {/* Rota Exclusiva de Administração */}
                    <Route 
                        path="/admin" 
                        element={<AdminRoute><AdminPage /></AdminRoute>} 
                    />

                    {/* Rota Padrão (Fallback) */}
                    <Route 
                        path="*" 
                        element={<Navigate to={user ? "/" : "/login"} replace />} 
                    />
                    
                </RouterRoutes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRoutes;