// src/components/layout/Sidebar.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../context/useAppContext";
import "../../styles/sidebar.css";

const items = [
  { to: "/", label: "Dashboard"},
  { to: "/monthly-balance", label: "Balanço"},
  { to: "/transactions", label: "Transações"},
  { to: "/budgets", label: "Orçamento"},
  { to: "/investments", label: "Investimentos"},
  { to: "/households", label: "Famílias"},
  { to: "/settings", label: "Configurações"},
  { to: "/user", label: "Usuários"},
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
            Administração
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
