// src/pages/Routes.jsx

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';

// Layouts
const Layout = lazy(() => import('../components/layout/Layout'));

// Páginas
const AuthPage = lazy(() => import('./AuthPage'));
const DashboardPage = lazy(() => import('./DashboardPage'));
const UsersPage = lazy(() => import('./UsersPage'));
const BalancePage = lazy(() => import('./BalancePage'));
const TransactionsPage = lazy(() => import('./TransactionsPage'));
const AdminPage = lazy(() => import('./AdminPage'));
const BudgetsPage = lazy(() => import('./BudgetsPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const EditTransactionPage = lazy(() => import('./EditTransactionPage'));
const HouseholdsPage = lazy(() => import('./HouseholdsPage'));
const InvestimentsPage = lazy(() => import('./InvestimentsPage'));
const VersionPage = lazy(() => import('./VersionPage'));

// 1. Rota Protegida Comum (Usuário Logado)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAppContext();
  if (loading) return <div className="app-loading">Carregando usuário...</div>;
  if (!user) {
    return <Navigate to="/login" replace/>;
  }
  return children;
};

// 2. Rota de Administração (Usuário Admin)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAppContext();
  if (loading) return <div className="app-loading">Carregando autorização...</div>;
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace/>;
  }
  return children;
};

// 3. Rota de Autenticação (Redirecionamento se já logado)
const AuthRoute = ({ children }) => {
  const { user } = useAppContext();
  if (user) {
    return <Navigate to="/" replace/>;
  }
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAppContext();

  if (loading) {
    return <div className="App">Carregando informações do sistema...</div>;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="page-loading-fallback">Carregando página...</div>}>
        <RouterRoutes>

          {/* Rota Pública */}
          <Route
            path="/login"
            element={<AuthRoute><AuthPage/></AuthRoute>}
        />

          {/* Protegidas: Tudo dentro do Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout>
                  <Outlet/>
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage/>}/>
            <Route path="/monthly-balance" element={<BalancePage/>}/>
            <Route path="/transactions" element={<TransactionsPage/>}/>
            <Route path="/transaction/edit/:id" element={<EditTransactionPage/>}/>
            <Route path="/budgets" element={<BudgetsPage/>}/>
            <Route path="/user" element={<UsersPage/>}/>
            <Route path="/settings" element={<SettingsPage/>}/>
            <Route path="/households" element={<HouseholdsPage/>}/>
            <Route path="/investments" element={<InvestimentsPage/>}/>
            <Route path="/versin" element={<VersionPage/>}/>

            {/* Admin (com proteção extra) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage/>
                </AdminRoute>
              }
          />
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/login"} replace/>}
        />
        </RouterRoutes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
