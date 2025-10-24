// src/components/layout/Header.jsx

import React from "react";
import { useAppContext } from "../../context/useAppContext";

const logoUrl = "/logo.svg";

const Header = () => {
  const { userName, familyName, householdId, changeHousehold, userId, user } = useAppContext();

  // Detecta impersonação (está em uma família diferente da original do usuário)
  const isImpersonating = user?.householdId && householdId && !user.householdId.includes(householdId);

  return (
    <header
      style={{
        height: 60,
        background: "#fff",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        justifyContent: "space-between"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logoUrl} alt="EasyMoney Logo" style={{ height: 38, marginRight: 18 }} />
        <span>
          <span style={{ fontWeight: "bold" }}>Família:</span> {familyName}
          <span style={{ color: "#afafaf", fontSize: 13, marginLeft: 6 }}>({householdId})</span>
          {isImpersonating && (
            <button
              style={{
                marginLeft: 16,
                background: "#f1dbff",
                border: "none",
                borderRadius: 4,
                color: "#49456d",
                cursor: "pointer",
                padding: "4px 12px"
              }}
              onClick={() => changeHousehold(user.householdId[0])}
            >
              Voltar à minha família
            </button>
          )}
        </span>
      </div>
      <div>
        <span style={{ marginRight: 18 }}>👤 {userName}</span>
        {/* <button style={{ marginLeft: 8 }}>Perfil</button> */}
      </div>
    </header>
  );
};

export default Header;
