// src/pages/UsersPage.jsx

import React from 'react';
import { useAppContext } from '../context/useAppContext';
import UserProfileForm from '../components/forms/UserProfileForm';

export default function UsersPage() {
  const { user } = useAppContext();

  if (!user) {
    return <div className="loading">Carregando dados do usuário...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Configurações de Perfil</h1>
      </div>
      <section className="section">
        <h2 className="section-title">Dados Pessoais</h2>
        <div className="card">
          <UserProfileForm/>
        </div>
      </section>
    </div>
  );
}
