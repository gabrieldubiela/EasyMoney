// src/components/layout/Sidebar.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../context/useAppContext";

const items = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/monthly-balance", label: "Balanço Mensal", icon: "📊" },
  { to: "/transactions", label: "Transações", icon: "💸" },
  { to: "/budgets", label: "Orçamento", icon: "🗂️" },
  { to: "/investments", label: "Investimentos", icon: "📈" },
  { to: "/households", label: "Famílias", icon: "👨‍👩‍👧" },
  { to: "/settings", label: "Configurações", icon: "⚙️" },
  { to: "/user", label: "Usuários", icon: "🙍‍♂️" },
];

const Sidebar = () => {
  const { user } = useAppContext();

  return (
    <aside style={{
      width: 220,
      background: "#24263a",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      padding: "14px 0",
      height: "100vh",
      position: "sticky",
      top: 0,
    }}>
      <div style={{ fontWeight: "bold", fontSize: 20, textAlign: "center", marginBottom: 20 }}>
        EasyMoney
      </div>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            padding: "10px 28px",
            color: isActive ? "#fff" : "#b0b7db",
            textDecoration: "none",
            background: isActive ? "#353864" : "none",
            borderLeft: isActive ? "4px solid #6791ef" : "4px solid transparent",
            fontWeight: isActive ? "bold" : undefined,
            transition: "background .14s"
          })}
          end
        >
          <span style={{ marginRight: 10 }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {user?.isAdmin && (
        <>
          <div style={{ margin: "8px 0 0 28px", color: "#999", fontSize: 12 }}>Administração</div>
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              padding: "10px 28px",
              color: isActive ? "#fff" : "#b0b7db",
              background: isActive ? "#7a2755" : "none",
              borderLeft: isActive ? "4px solid #a43976" : "4px solid transparent",
              fontWeight: isActive ? "bold" : undefined,
              transition: "background .14s"
            })}
            end
          >
            <span style={{ marginRight: 10 }}>🛡️</span>
            Admin
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
