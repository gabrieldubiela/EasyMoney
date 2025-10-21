// src/components/ui/Nav.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import { auth } from '../../firebase/firebaseConfig';

const Nav = () => {
    const { userId, familyName, loading } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    if (loading || !userId) return null;

    const householdName = familyName ? `Família: ${familyName}` : 'Sem Família';

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        setIsMenuOpen(false);
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
                <a href="/" className="nav-brand">EasyMoney</a>
                <span className={`nav-info ${isMenuOpen ? 'active' : ''}`}>{householdName}</span>
                <button
                    className="nav-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <span className="nav-toggle-icon"></span>
                </button>
                <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <Link to="/user" className="nav-link" onClick={handleLinkClick}>Perfil</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/monthly-balance" className="nav-link" onClick={handleLinkClick}>Balanço Mensal</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/transactions" className="nav-link" onClick={handleLinkClick}>Transações</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/settings" className="nav-link" onClick={handleLinkClick}>Configurações</Link>
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
