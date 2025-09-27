// src/routes/Routes.jsx

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useHousehold } from '../hooks/useHousehold';


// --- Importação de Componentes (Certifique-se que o caminho 'pages' está correto) ---

// Componentes UI
const Nav = lazy(() => import('../components/ui/Nav')); // Importa o Nav que criamos

// Páginas Existentes/Principais
const AuthPage = lazy(() => import('../pages/AuthPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const MonthlyBalancePage = lazy(() => import('../pages/MonthlyBalancePage'));
// Assumindo que o ExpenseListPage cobre a TransactionListPage
const TransactionListPage = lazy(() => import('../pages/TransactionListPage')); 

// NOVAS PÁGINAS IMPLEMENTADAS
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const AnnualBudgetSheetPage = lazy(() => import('../pages/AnnualBudgetSheetPage'));
const CategoriesAndTypesPage = lazy(() => import('../pages/CategoriesAndTypesPage'));
const EditTransactionPage = lazy(() => import('../pages/EditTransactionPage'));
// -----------------------------------------------------------------------------------


// --- Componente de Layout (Menu de Navegação Simulado) ---
// NOTA: Removemos o NavMenu daqui. Usaremos o componente Nav.jsx importado.
// --------------------------------------------------------


// --- Componente de Proteção de Rotas ---

// 1. Rota Protegida Comum (Usuário Logado)
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useHousehold();
    if (loading) return <div className="app-loading">Carregando usuário...</div>;
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// 2. Rota de Administração (Usuário Admin)
const AdminRoute = ({ children }) => {
    const { user, loading } = useHousehold();
    if (loading) return <div className="app-loading">Carregando autorização...</div>;
    
    // Se não estiver logado OU não for admin, volta para a dashboard
    if (!user || !user.isAdmin) { 
        return <Navigate to="/" replace />;
    }
    return children;
};

// 3. Rota de Autenticação (Redirecionamento se já logado)
const AuthRoute = ({ children }) => {
    const { user } = useHousehold();
    if (user) {
        return <Navigate to="/" replace />;
    }
    return children;
};


// --- Componente Principal de Roteamento ---
const AppRoutes = () => {
    // Usaremos apenas o 'user' e 'isLoading' para o roteamento inicial
    const { user, loading } = useHousehold(); 

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
                        element={<ProtectedRoute><TransactionListPage /></ProtectedRoute>} 
                    />
                    {/* Rota para Lançamentos/Lista (usando /transactions como principal) */}
                    <Route 
                        path="/transaction/edit/:id" 
                        element={<ProtectedRoute><EditTransactionPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/annual-sheet" 
                        element={<ProtectedRoute><AnnualBudgetSheetPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/settings" 
                        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/categories" 
                        element={<ProtectedRoute><CategoriesAndTypesPage /></ProtectedRoute>} 
                    />

                    {/* Rota Exclusiva de Administração */}
                    <Route 
                        path="/admin" 
                        element={<AdminRoute><AdminDashboardPage /></AdminRoute>} 
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