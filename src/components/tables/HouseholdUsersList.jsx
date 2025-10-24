// src/components/tables/HouseholdUsersList.jsx

import React from "react";
import useHouseholdMembers from "../../hooks/useHouseholdMembers";
import "../../styles/tables.css";
import "../../styles/buttons.css";

export default function HouseholdUsersList({ householdId, isAdmin, showToast }) {
  const { members, loading, error, setAdminStatus, removeMember } = useHouseholdMembers(householdId);

  const handleAdmin = async (uid, status) => {
    const ok = await setAdminStatus(uid, status);
    if (ok && showToast) showToast({ type: "success", message: "Permissão alterada!" });
  };

  const handleRemove = async (uid) => {
    const ok = await removeMember(uid);
    if (ok && showToast) showToast({ type: "success", message: "Usuário removido!" });
  };

  if (loading) return <div>Carregando membros...</div>;
  if (error) return <div className="error-table-row">{error}</div>;

  return (
    <div className="table-wrapper household-users-list">
      <table className="table">
        <thead>
          <tr>
            <th>Usuário (UID)</th>
            <th>Admin</th>
            {isAdmin && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.uid}>
              <td>{m.uid}</td>
              <td>{m.isAdmin ? "✅" : ""}</td>
              {isAdmin && (
                <td>
                  {!m.isAdmin && (
                    <button
                      className="btn"
                      onClick={() => handleAdmin(m.uid, true)}
                    >
                      Promover a admin
                    </button>
                  )}
                  {m.isAdmin && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleAdmin(m.uid, false)}
                    >
                      Remover admin
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleRemove(m.uid)}
                  >
                    Remover membro
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
