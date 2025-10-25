// src/components/layout/Sidebar.jsx

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAppContext } from "../../context/useAppContext";
import "../../styles/sidebar.css";

const logoUrl = "/logo.svg";

const items = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/monthly-balance", label: "Balanço", icon: "📈" },
  { to: "/transactions", label: "Transações", icon: "💸" },
  { to: "/budgets", label: "Orçamento", icon: "🎯" },
  { to: "/investments", label: "Investimentos", icon: "💰" },
  { to: "/settings", label: "Configurações", icon: "⚙️" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, userName, familyName } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose(); // Fecha sidebar em mobile
  };

  // Iniciais do usuário para avatar
  const userInitials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <>
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        {/* Botão de fechar (mobile only) */}
        {onClose && (
          <button className="sidebar-close" onClick={onClose} aria-label="Fechar menu">
            ×
          </button>
        )}

        {/* Logo clicável para Dashboard */}
        <NavLink to="/" className="sidebar-logo" onClick={() => handleNavigation("/")}>
          <img src={logoUrl} alt="EasyMoney" className="sidebar-logo-image" />
        </NavLink>

        {/* Seção de Usuário e Família */}
        <div className="sidebar-user-section">
          {/* Link para User */}
          <div className="sidebar-user-link" onClick={() => handleNavigation("/user")}>
            <div className="sidebar-user-avatar">{userInitials}</div>
            <span className="sidebar-user-name">{userName || "Usuário"}</span>
          </div>

          {/* Link para Household/Família */}
          <div className="sidebar-family-link" onClick={() => handleNavigation("/households")}>
            <div className="sidebar-family-icon">👨‍👩‍👧‍👦</div>
            <span className="sidebar-family-name">Família {familyName || "Sem nome"}</span>
          </div>
        </div>

        {/* Links de navegação */}
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
              }
              onClick={() => handleNavigation(item.to)}
              end
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-text">{item.label}</span>
            </NavLink>
          ))}

          {/* Admin link */}
          {user?.isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `sidebar-link sidebar-link--admin ${isActive ? "sidebar-link--active" : ""}`
              }
              onClick={() => handleNavigation("/admin")}
              end
            >
              <span className="sidebar-link-icon">🔐</span>
              <span className="sidebar-link-text">Administração</span>
            </NavLink>
          )}
        </nav>

        {/* Footer com Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay (mobile only) */}
      {isOpen && onClose && (
        <div className="sidebar-overlay sidebar-overlay--visible" onClick={onClose} />
      )}
    </>
  );
};

export default Sidebar;
