// src/components/ui/Nav.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useHousehold } from '../../hooks/useHousehold'; 
import { auth } from '../../firebase/firebaseConfig'; 

const Nav = () => {
    const { user, familyName, loading } = useHousehold(); 
    
    if (loading || !user) return null;

    const householdName = familyName ? `Família: ${familyName.substring(0, 4)}...` : 'Sem Família';

    
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
                <Link to="/user">{user.firstName}</Link>
                <Link to="/monthly-balance">Balanço Mensal</Link>
                <Link to="/transactions">Transações</Link>
                <Link to="/settings">Configurações</Link>
                <button onClick={handleLogout}>Sair</button>
            </div>
        </nav>
    );
};

export default Nav;