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
        <nav className="nav">
            <div className="nav-container">
                <span className="nav-info">{householdName}</span>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/user" className="nav-link">{user.firstName}</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/monthly-balance" className="nav-link">Balanço Mensal</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/transactions" className="nav-link">Transações</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/settings" className="nav-link">Configurações</Link>
                    </li>
                    <li className="nav-item">
                        <button onClick={handleLogout} className="primary nav-button">Sair</button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Nav;