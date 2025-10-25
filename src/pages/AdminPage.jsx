// src/pages/AdminPage.jsx

import React, { useState } from 'react';
import HouseholdAdminSwitcher from '../components/tables/HouseholdAdminSwitcher';
import UserAdminTable from '../components/tables/UserAdminTable';
import UserAdminForm from '../components/forms/UserAdminForm';

export default function AdminPage() {
  const [editingUser, setEditingUser] = useState(null);

  const handleSwitchFamily = (householdId) => {
    // Aqui você deve implementar a lógica para setar o householdId global/contexto/redirect
    window.alert(`Acesso admin à família ${householdId} (implemente logicamente)`); // implementar contexto!
  };

  return (
    <div>
      <h1>Administração Geral</h1>

      {/* 1. Bloquinho para trocar de família */}
      <HouseholdAdminSwitcher onSwitch={handleSwitchFamily}/>

      {/* 2. Gestão de usuários */}
      <UserAdminTable onEdit={setEditingUser}/>

      {/* 3. Edição/criação de usuário */}
      {editingUser && (
        <UserAdminForm
          editingUser={editingUser}
          onSaved={() => setEditingUser(null)}
          onCancel={() => setEditingUser(null)}
      />
      )}
    </div>
  );
}
