// src/components/forms/UserUpdateForm.jsx

import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/firebaseConfig';
import { updateProfile } from 'firebase/auth'; 
import { useHousehold } from '../../../hooks/useHousehold'; // Para acessar o objeto user

const UserUpdateForm = () => {
    const { user } = useHousehold();
    const [userName, setUserName] = useState(user?.displayName || '');
    const [userLoading, setUserLoading] = useState(false);

    // Sincroniza o estado local com o nome do usuário do contexto
    useEffect(() => {
        if (user?.displayName) {
            setUserName(user.displayName);
        }
    }, [user?.displayName]);

    const handleUpdateUserName = async (e) => {
        e.preventDefault();
        if (!user || userName.trim() === '') {
            alert("O nome de usuário não pode estar vazio.");
            return;
        }

        setUserLoading(true);
        try {
            await updateProfile(user, { displayName: userName.trim() });
            alert('Nome de usuário atualizado com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar nome do usuário:", error);
            alert('Falha ao atualizar nome. Tente novamente.');
        } finally {
            setUserLoading(false);
        }
    };

    if (!user) return <p>Carregando dados do usuário...</p>;

    return (
        <section style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
            <h2>Seus Dados Pessoais</h2>
            <p>Email: <strong>{user.email}</strong></p>

            <form onSubmit={handleUpdateUserName}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Seu Nome de Exibição:</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nome Completo ou Apelido"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    required
                />
                <button type="submit" disabled={userLoading}>
                    {userLoading ? 'Atualizando...' : 'Atualizar Nome'}
                </button>
            </form>
        </section>
    );
};

export default UserUpdateForm;