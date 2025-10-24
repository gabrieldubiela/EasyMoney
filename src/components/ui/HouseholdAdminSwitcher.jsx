// src/components/ui/HouseholdAdminSwitcher.jsx

import React from 'react';
import useAllHouseholds from '../../hooks/useAllHouseholds';
import { useAppContext } from '../../context/useAppContext';

const HouseholdAdminSwitcher = () => {
  const { households, loading, error } = useAllHouseholds();
  const { changeHousehold, familyName, householdId } = useAppContext();

  if (loading) return <div>Carregando famílias...</div>;
  if (error) return <div style={{ color: 'red' }}>Erro ao carregar famílias</div>;

  return (
    <div style={{ marginBottom: 16 }}>
      <h3>Famílias</h3>
      <p>
        <strong>Família atual:</strong> {familyName} <span style={{ color: '#999', fontSize: 12 }}>({householdId})</span>
      </p>
      <table>
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
                <button onClick={() => changeHousehold(f.id)}>Impersonar família</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HouseholdAdminSwitcher;
