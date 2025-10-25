// src/components/tables/HouseholdAdminSwitcher.jsx

import React from 'react';
import useAllHouseholds from '../../hooks/useAllHouseholds';
import { useAppContext } from '../../context/useAppContext';
import "../../styles/tables.css";
import "../../styles/buttons.css";

const HouseholdAdminSwitcher = () => {
  const { households, loading, error } = useAllHouseholds();
  const { changeHousehold, familyName, householdId } = useAppContext();

  if (loading) return <div className="loading">Carregando famílias...</div>;
  if (error) return <div className="form-error">Erro ao carregar famílias</div>;

  return (
    <div className="table-wrapper household-admin-switcher">
      <h3>Famílias</h3>
      <p>
        <strong>Família atual:</strong> {familyName}{" "}
        <span className="muted">
          ({householdId})
        </span>
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>ID</th>
            <th>Membros</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {households.map(f => (
            <tr key={f.id}>
              <td>{f.familyName || '-'}</td>
              <td>{f.id}</td>
              <td>{Object.keys(f.members || {}).length}</td>
              <td>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => changeHousehold(f.id)}
                >
                  Impersonar família
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HouseholdAdminSwitcher;
