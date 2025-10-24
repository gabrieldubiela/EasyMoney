// src/components/forms/UserAdminForm.jsx

import React, { useState, useEffect } from 'react';
import { updateUser } from '../../services/userService';
import "../../styles/forms.css";
import "../../styles/buttons.css";

const UserAdminForm = ({ editingUser, onSaved, onCancel }) => {
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [householdIds, setHouseholdIds] = useState('');
  const [formError, setFormError] = useState("");

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
    setFormError("");
    if (!name.trim()) {
      setFormError("Nome obrigatório.");
      return;
    }
    const householdsArr = householdIds.split(',').map(s => s.trim()).filter(Boolean);
    if (editingUser?.id) {
      await updateUser(editingUser.id, { name, isAdmin, householdId: householdsArr });
    } else {
      setFormError("Criação manual: gere o UID e senha pelo registro!");
      return;
    }
    onSaved && onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="form user-admin-form" autoComplete="off" style={{ margin: 0 }}>
      <h4>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h4>

      <div className="form-group">
        <label className="form-label required" htmlFor="useradmin-name">Nome</label>
        <input
          id="useradmin-name"
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome"
        />
      </div>

      <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', margin: 0 }}>
        <input
          id="useradmin-admin"
          type="checkbox"
          checked={isAdmin}
          onChange={e => setIsAdmin(e.target.checked)}
          style={{ marginRight: 4 }}
        />
        <label htmlFor="useradmin-admin" className="form-label" style={{ marginBottom: 0, cursor: "pointer" }}>
          Admin do sistema
        </label>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="useradmin-households">
          IDs de famílias <span className="form-info">(separados por vírgula)</span>
        </label>
        <input
          id="useradmin-households"
          type="text"
          value={householdIds}
          onChange={e => setHouseholdIds(e.target.value)}
          placeholder="IDs de famílias (separados por vírgula)"
        />
      </div>

      {formError && <div className="form-error">{formError}</div>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Salvar
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default UserAdminForm;
