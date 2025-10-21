// src/components/ui/forms/ProfileDataForm.jsx

import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth'; 
import { doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../../firebase/firebaseConfig'; // db do Firestore

const ProfileDataForm = ({ user }) => {
    // user é o objeto completo (Auth + Firestore) passado via prop.
    const [displayName, setDisplayName] = useState(user?.name || ''); 
    const [isUpdating, setIsUpdating] = useState(false);

    // Sincroniza o estado local com o nome do usuário do contexto
    useEffect(() => {
        if (user?.name) {
            setDisplayName(user.name);
        }
    }, [user?.name]); 

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        const newDisplayName = displayName.trim();

        if (!user || newDisplayName === '') {
            alert("O nome de exibição não pode estar vazio.");
            return;
        }

        setIsUpdating(true);
        
        try {
            // 1. ATUALIZAÇÃO NO FIRESTORE (name)
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                name: newDisplayName,
            });

            // 2. ATUALIZAÇÃO DO FIREBASE AUTH (displayName)
            // Isso garante que o nome do usuário no objeto 'user' do Auth seja atualizado
            if (user.displayName !== newDisplayName) {
                await updateProfile(user, { displayName: newDisplayName });
            }
            
            alert('Dados de perfil atualizados com sucesso!');
            
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert('Falha ao atualizar dados. Tente novamente. Verifique o console.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <section>
            <h3>Dados Básicos (Nome e Sobrenome)</h3>
            <p>Email: {user.email}</p>

            <form onSubmit={handleUpdateProfile}>
                
                {/* CAMPO NOME / DISPLAY NAME */}
                <div>
                    <label htmlFor="displayName">Nome:</label>
                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Nome"
                        required
                    />
                </div>

                <button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Salvando...' : 'Salvar Dados'}
                </button>
            </form>
        </section>
    );
};

export default ProfileDataForm;