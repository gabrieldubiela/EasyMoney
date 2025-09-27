// src/components/ui/admin/HouseholdManagement.jsx (CÓDIGO COMPLETO ATUALIZADO)

import React, { useState, useMemo } from 'react';
import useAllHouseholds from '../../../hooks/useAllHouseholds';
import useAllUsers from '../../../hooks/useAllUsers'; // NOVO: Hook para listar todos os usuários
import { db } from '../../../firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const HouseholdManagement = () => {
    // 1. Busca de Dados
    const { households, loading: householdsLoading, error: householdsError } = useAllHouseholds();
    const { users, loading: usersLoading, error: usersError } = useAllUsers(); // Busca todos os usuários
    
    // Estados de Edição
    const [editingId, setEditingId] = useState(null);
    const [newName, setNewName] = useState('');

    // 2. Lógica de Agrupamento e Contagem de Membros (Otimização com useMemo)
    const householdsWithMembers = useMemo(() => {
        if (!users || users.length === 0) {
            return households.map(h => ({ ...h, memberCount: 0, members: [] }));
        }

        // 2a. Mapeia usuários por householdId para contagem rápida
        const userMap = users.reduce((acc, user) => {
            const hid = user.householdId || 'NO_HOUSEHOLD'; // Agrupa usuários sem família
            if (!acc[hid]) {
                acc[hid] = { count: 0, list: [] };
            }
            acc[hid].count += 1;
            acc[hid].list.push(user);
            return acc;
        }, {});

        // 2b. Combina dados da família com a contagem de membros
        const combinedData = households.map(h => {
            const members = userMap[h.id] || { count: 0, list: [] };
            return {
                ...h,
                memberCount: members.count,
                members: members.list, // Inclui a lista completa para futuras ações
            };
        });

        // Opcional: Adiciona uma linha para usuários sem família
        if (userMap['NO_HOUSEHOLD']) {
            combinedData.push({
                id: 'NO_HOUSEHOLD',
                name: 'USUÁRIOS SEM FAMÍLIA (PENDENTES)',
                memberCount: userMap['NO_HOUSEHOLD'].count,
                members: userMap['NO_HOUSEHOLD'].list,
                isPending: true,
            });
        }

        return combinedData;
    }, [households, users]);


    // Funções de Ação (Mantidas)
    const startEdit = (household) => {
        setEditingId(household.id);
        setNewName(household.name);
    };

    const saveNewName = async (householdId) => {
        if (!newName.trim()) {
            alert("O nome da família não pode ser vazio.");
            return;
        }

        try {
            const householdRef = doc(db, 'households', householdId);
            await updateDoc(householdRef, { name: newName.trim() });
            alert(`Nome da família atualizado para: ${newName.trim()}`);
            setEditingId(null);
            setNewName('');
        } catch (e) {
            console.error("Erro ao atualizar nome da família:", e);
            alert("Erro ao tentar atualizar o nome da família.");
        }
    };
    
    // NOVO: Função para atribuir uma família a um usuário
    const assignUserToHousehold = async (userId, householdId, householdName) => {
        if (!window.confirm(`Tem certeza que deseja mover o usuário para a família: ${householdName || 'NENHUMA'}?`)) {
            return;
        }
        
        try {
            const userRef = doc(db, 'users', userId);
            // Define o householdId como null se for para 'NENHUMA' (sem família)
            const newHouseholdId = householdId === 'NONE' ? null : householdId; 
            
            await updateDoc(userRef, {
                householdId: newHouseholdId
            });
            alert(`Usuário ${users.find(u => u.id === userId)?.email} movido com sucesso!`);
        } catch (e) {
            console.error("Erro ao mover usuário:", e);
            alert("Erro ao tentar mover usuário.");
        }
    };


    if (householdsLoading || usersLoading) return <div>Carregando dados de Famílias e Usuários...</div>;
    if (householdsError || usersError) return <div>Erro ao carregar dados: {householdsError || usersError}</div>;

    return (
        <div>
            <h3>Gestão de Famílias</h3>
            <p>Total de grupos ativos: {households.length}</p>

            <table>
                <thead>
                    <tr>
                        <th>Nome da Família</th>
                        <th>ID da Família</th>
                        <th>Membros</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {householdsWithMembers.map(household => (
                        <React.Fragment key={household.id}>
                            <tr style={{ backgroundColor: household.isPending ? '#fdd' : 'inherit' }}>
                                <td>
                                    {editingId === household.id ? (
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            disabled={household.isPending} // Não edita o placeholder
                                        />
                                    ) : (
                                        <strong>{household.name}</strong>
                                    )}
                                </td>
                                <td>
                                    <code>{household.id}</code>
                                </td>
                                <td>
                                    {household.memberCount}
                                </td>
                                <td>
                                    {/* Botões de Edição do Nome */}
                                    {!household.isPending && (
                                        editingId === household.id ? (
                                            <>
                                                <button onClick={() => saveNewName(household.id)}>Salvar</button>
                                                <button onClick={() => setEditingId(null)}>Cancelar</button>
                                            </>
                                        ) : (
                                            <button onClick={() => startEdit(household)}>Editar Nome</button>
                                        )
                                    )}
                                    <button 
                                        onClick={() => setEditingId(editingId === `members-${household.id}` ? null : `members-${household.id}`)}
                                    >
                                        {editingId === `members-${household.id}` ? 'Ocultar Membros' : 'Gerenciar Membros'}
                                    </button>
                                </td>
                            </tr>

                            {/* LINHA EXPANSÍVEL PARA GERENCIAR MEMBROS */}
                            {editingId === `members-${household.id}` && (
                                <tr>
                                    <td colSpan="4">
                                        <h4>Membros de {household.name} ({household.memberCount})</h4>
                                        <ul>
                                            {household.members.map(member => (
                                                <li key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                    <span>{member.email} ({member.isAdmin ? 'Admin' : 'Membro'})</span>
                                                    
                                                    {/* SELECT PARA MOVER O MEMBRO */}
                                                    <select 
                                                        onChange={(e) => assignUserToHousehold(member.id, e.target.value, e.target.options[e.target.selectedIndex].text)}
                                                        defaultValue={member.householdId || 'NONE'}
                                                    >
                                                        <option value="NONE">Mover para: NENHUMA FAMÍLIA</option>
                                                        {households.map(h => (
                                                            <option key={h.id} value={h.id}>{h.name}</option>
                                                        ))}
                                                    </select>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        {household.members.length === 0 && <p>Nenhum membro neste grupo.</p>}
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HouseholdManagement;