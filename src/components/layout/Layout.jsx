// src/components/layout/Layout.jsx

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Layout = ({ children }) => (
  <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#f9f9fb' }}>
    <Sidebar />
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>
        {/* Se vier de rotas, usa Outlet. Se vier de props, usa children (ambos funcionam!) */}
        <Outlet />
        {children}
      </main>
    </div>
  </div>
);

export default Layout;
