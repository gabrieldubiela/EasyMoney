// src/components/forms/UserAdminForm.jsx

import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../../services/userService';

const UserAdminForm = ({ editingUser, onSaved, onCancel }) => {
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [householdIds, setHouseholdIds] = useState('');

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || '');
      setIsAdmin(!!editingUser.isAdmin);
      setHouseholdIds(Array.isArray(editingUser.householdId) ? editingUser.householdId.join(',') : '');
    } else {
      setName('');
      setIsAdmin(false);
      setHouseholdIds('');
    }
  }, [editingUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const householdsArr = householdIds.split(',').map(s => s.trim()).filter(Boolean);
    if (editingUser?.id) {
      await updateUser(editingUser.id, { name, isAdmin, householdId: householdsArr });
    } else {
      // UID deve ser gerado fora (ex: via registro no Auth)
      alert('Criação manual: gere o UID e senha pelo registro!');
      return;
    }
    onSaved && onSaved();
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: 12, border: '1px solid #ccc', padding: 8 }}>
      <h4>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h4>
      <input
        type="text"
        required
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nome"
      />
      <label>
        <input
          type="checkbox"
          checked={isAdmin}
          onChange={e => setIsAdmin(e.target.checked)}
        />
        Admin do sistema
      </label>
      <input
        type="text"
        value={householdIds}
        onChange={e => setHouseholdIds(e.target.value)}
        placeholder="IDs de famílias (separados por vírgula)"
      />
      <button type="submit">Salvar</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancelar</button>
    </form>
  );
};

export default UserAdminForm;
