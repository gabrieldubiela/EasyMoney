// src/components/layout/Layout.jsx

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "../../styles/layout.css"; 

const Layout = () => (
  <div className="app-layout">
    <Sidebar/>
    <div className="app-main-area">
      <Header/>
      <main className="app-content">
        {/* Se vier de rotas, usa Outlet. Se vier de props, usa children (ambos funcionam!) */}
        <Outlet/>
      </main>
    </div>
  </div>
);

export default Layout;
