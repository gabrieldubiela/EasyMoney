// src/components/ui/admin/UserManagement.jsx

import React from 'react';
import useAllUsers from '../../../hooks/useAllUsers';
import { db } from '../../../firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const UserManagement = () => {
    const { users, loading, error } = useAllUsers();

    // Função para alternar o status 'isAdmin' do usuário
    const toggleAdminStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Tem certeza que deseja ${currentStatus ? 'REMOVER' : 'ATRIBUIR'} a função de Administrador deste usuário?`)) {
            return;
        }

        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                isAdmin: !currentStatus
            });
            alert(`Função de administrador de ${users.find(u => u.id === userId)?.email} alterada com sucesso!`);
        } catch (e) {
            console.error("Erro ao atualizar status admin:", e);
            alert("Erro ao tentar atualizar o status de administrador.");
        }
    };

    if (loading) return <div>Carregando lista de usuários...</div>;
    if (error) return <div>Erro: {error}</div>;

    return (
        <div>
            <h3>Gestão de Usuários (Acessos)</h3>
            <p>Total de usuários no sistema: {users.length}</p>

            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Família (householdId)</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.email}</td>
                            <td>
                                <span style={{ fontWeight: 'bold', color: user.isAdmin ? 'red' : 'green' }}>
                                    {user.isAdmin ? 'ADMIN' : 'Membro Comum'}
                                </span>
                            </td>
                            <td>{user.householdId || 'NENHUMA'}</td>
                            <td>
                                <button 
                                    onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                                >
                                    {user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                                </button>
                                {/* Implementar 'Bloquear Usuário' aqui futuramente */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;