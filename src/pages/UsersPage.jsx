// src/pages/UsersPage.jsx

import React from 'react';
import { useAppContext } from '../context/useAppContext';
import UserProfilePanel from '../components/ui/UserProfilePanel';
import HouseholdUpdateForm from '../components/forms/HouseholdUpdateForm';
import InviteCodeDisplay from '../components/domains/InviteCodeDisplay';

export default function UsersPage() {
  const { user, householdId } = useAppContext();

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
          <UserProfilePanel />
        </div>
      </section>
      {householdId && (
        <section className="section">
          <h2 className="section-title">Dados da Família</h2>
          <div className="card">
            <HouseholdUpdateForm householdId={householdId} />
          </div>
          <div className="card mt-md">
            <InviteCodeDisplay householdId={householdId} />
          </div>
        </section>
      )}
    </div>
  );
}
