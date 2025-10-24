// src/components/table/UserAdminTable.jsx

import React from "react";
import useAllUsers from "../../hooks/useAllUsers";
import { deleteUser, updateUser } from "../../services/userService";
import "../../styles/tables.css";
import "../../styles/buttons.css";

const UserAdminTable = ({ onEdit }) => {
  const { users, loading, error } = useAllUsers();

  const handleDelete = async (uid) => {
    if (window.confirm("Deseja excluir este usuário permanentemente?")) {
      await deleteUser(uid);
      // Optionally: show a toast
    }
  };

  const toggleAdmin = async (user) => {
    await updateUser(user.id, { isAdmin: !user.isAdmin });
  };

  return (
    <div className="table-wrapper user-admin-table" style={{ marginBottom: 16 }}>
      <h3>Usuários do Sistema</h3>
      {loading ? (
        <div>Carregando usuários...</div>
      ) : error ? (
        <div className="error-table-row">{error}</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>UID</th>
              <th>Nome</th>
              <th>Admin</th>
              <th>Famílias</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>
                  {u.isAdmin ? "✅" : ""}
                  <button
                    className="btn btn-secondary"
                    onClick={() => toggleAdmin(u)}
                    style={{ marginLeft: 8 }}
                  >
                    {u.isAdmin ? "Remover Admin" : "Promover a Admin"}
                  </button>
                </td>
                <td>
                  {Array.isArray(u.householdId)
                    ? u.householdId.join(", ")
                    : ""}
                </td>
                <td>
                  <button className="btn" onClick={() => onEdit(u)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleDelete(u.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserAdminTable;
