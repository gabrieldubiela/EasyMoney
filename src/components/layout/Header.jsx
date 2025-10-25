// src/components/layout/Header.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/useAppContext";
import "../../styles/header.css";

const logoUrl = "/logo.svg";

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { userName, familyName } = useAppContext();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="header">
      {/* Menu toggle */}
      <button
        className={`header-menu-toggle ${isSidebarOpen ? "header-menu-toggle--active" : ""}`}
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
      >
        <div className="header-menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Logo clicável */}
      <div className="header-logo-link" onClick={handleLogoClick}>
        <img src={logoUrl} alt="EasyMoney" className="header-logo" />
      </div>

      {/* Info central - esconde quando sidebar abre */}
      <div className={`header-info ${isSidebarOpen ? "header-info--hidden" : ""}`}>
        <div className="header-user-link" onClick={() => navigate("/user")}>
          {userName || "Usuário"}
        </div>
        <div className="header-family-link" onClick={() => navigate("/households")}>
          Família {familyName || "Sem nome"}
        </div>
      </div>
    </header>
  );
};

export default Header;
