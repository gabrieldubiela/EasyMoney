// src/components/ui/Nav.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // Importante: Componente Link
import { useHousehold } from '../../hooks/useHousehold'; 
import { auth } from '../../firebase/firebaseConfig'; 

const Nav = () => {
    const { user, householdId, loading } = useHousehold(); 
    
    if (loading || !user) return null; // Não exibe o nav enquanto carrega ou se não estiver logado

    const householdName = householdId ? `Família ID: ${householdId.substring(0, 4)}...` : 'Sem Família';
    const isAdmin = user && user.isAdmin === true;
    
    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            alert("Falha ao desconectar.");
        }
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc' }}>
            {/* Cabeçalho da Família */}
            <div style={{ fontWeight: 'bold' }}>
                🏠 {householdName}
            </div>
            
            {/* Links de Navegação */}
            <div style={{ display: 'flex', gap: '15px' }}>
                {/* O atributo 'to' no Link corresponde ao 'path' na sua rota */}
                <Link to="/">Dashboard</Link>
                <Link to="/monthly-balance">Saldo Mensal</Link>
                <Link to="/transactions">Lançamentos/Lista</Link>
                <Link to="/annual-sheet">Planilha Anual</Link>
                
                <span style={{ margin: '0 5px' }}>|</span>

                {/* Links de Configuração */}
                <Link to="/categories">Categorias</Link>
                <Link to="/settings">Configurações</Link>

                {/* Link Condicional para o Painel de Administração */}
                {isAdmin && (
                    <Link to="/admin" style={{ color: 'red' }}>🛠️ Admin</Link>
                )}
            </div>
            
            {/* Informações do Usuário e Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Bem-vindo(a), {user.email}</span>
                <button onClick={handleLogout} style={{ padding: '5px 10px' }}>Sair</button>
            </div>
        </nav>
    );
};

export default Nav;