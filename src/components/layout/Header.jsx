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
      <div >
        <img src={logoUrl} alt="EasyMoney Logo" className="header-logo"/>
        <span >
          <span>Família:</span> {familyName}
          <span className="muted">({householdId})</span>
          {isImpersonating && (
            <button
              className="btn btn-secondary btn-small"
              onClick={() => changeHousehold(user.householdId[0])}
            >
              Voltar à minha família
            </button>
          )}
        </span>
      </div>
      <div>
        <span className="header-user">👤 {userName}</span>
      </div>
    </header>
  );
};

export default Header;
