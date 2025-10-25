// src/components/layout/Layout.jsx

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../styles/layout.css";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle sidebar (apenas mobile)
  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
      document.body.classList.toggle('sidebar-open');
    }
  };

  // Fecha sidebar (apenas mobile)
  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
      document.body.classList.remove('sidebar-open');
    }
  };

  return (
    <div className="app-layout">
      {/* Header - visível apenas em mobile */}
      {isMobile && (
        <Header 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
      )}

      {/* Sidebar - sempre visível no desktop, toggle no mobile */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={isMobile ? closeSidebar : null}
      />

      {/* Área principal de conteúdo */}
      <div className="app-main-area">
        <main className="app-content">
          <div className="app-content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
