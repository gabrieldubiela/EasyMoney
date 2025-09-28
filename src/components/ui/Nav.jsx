// src/components/ui/Nav.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useHousehold } from '../../hooks/useHousehold'; 
import { auth } from '../../firebase/firebaseConfig'; 

const Nav = () => {
    const { user, familyName, loading } = useHousehold(); 
    
    if (loading || !user) return null;

    const householdName = familyName ? `Família: ${familyName.substring(0, 4)}...` : 'Sem Família';
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
        <nav>
            {/* Cabeçalho da Família */}
            <div >
                {householdName}
                {/* Links de Navegação */}
                <Link to="/settings">{user.firstName}</Link>
                <Link to="/">Dashboard</Link>
                <Link to="/monthly-balance">Balanço Mensal</Link>
                <Link to="/transactions">Lançamentos</Link>
                <Link to="/annual-sheet">Planilha Anual</Link>
                <Link to="/categories">Categorias</Link>
                {/* Link Condicional para o Painel de Administração */}
                {isAdmin && (<Link to="/admin">Painel do Administrador</Link>)}
                <button onClick={handleLogout}>Sair</button>
            </div>
        </nav>
    );
};

export default Nav;