// src/components/layout/Header.jsx

import React from "react";
import { useAppContext } from "../../context/useAppContext";
import "../../styles/buttons.css";
import "../../styles/header.css";

const logoUrl = "/logo.svg";

const Header = () => {
  const { userName, familyName, householdId, changeHousehold, user } = useAppContext();

  // Detecta impersonação (está em uma família diferente da original do usuário)
  const isImpersonating = user?.householdId && householdId && !user.householdId.includes(householdId);

  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logoUrl} alt="EasyMoney Logo" className="header-logo" />
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: "bold" }}>Família:</span> {familyName}
          <span className="muted">({householdId})</span>
          {isImpersonating && (
            <button
              className="btn btn-secondary btn-small"
              style={{ marginLeft: 16 }}
              onClick={() => changeHousehold(user.householdId[0])}
            >
              Voltar à minha família
            </button>
          )}
        </span>
      </div>
      <div>
        <span className="header-user">👤 {userName}</span>
        {/* <button className="btn btn-outline btn-small" style={{ marginLeft: 8 }}>Perfil</button> */}
      </div>
    </header>
  );
};

export default Header;
