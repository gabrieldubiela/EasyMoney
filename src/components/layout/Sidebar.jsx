// src/components/layout/Sidebar.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../context/useAppContext";
import "../../styles/sidebar.css"; // Crie conforme acima

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
    <aside className="sidebar">
      <div className="sidebar-logo">EasyMoney</div>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " sidebar-link--active" : "")
          }
          end
        >
          <span className="sidebar-link-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {user?.isAdmin && (
        <>
          <div className="sidebar-section-title">Administração</div>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              "sidebar-link" +
              (isActive
                ? " sidebar-link--active sidebar-link--admin"
                : "")
            }
            end
          >
            <span className="sidebar-link-icon">🛡️</span>
            Admin
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
