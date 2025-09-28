// src/components/ui/forms/HouseholdUpdateForm.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; 

const HouseholdUpdateForm = ({ householdId }) => {
    const [householdName, setHouseholdName] = useState('');
    const [householdLoading, setHouseholdLoading] = useState(false);

    // Carregar o Nome da Família
    useEffect(() => {
        if (!householdId) return;

        const fetchHouseholdName = async () => {
            setHouseholdLoading(true);
            try {
                const docRef = doc(db, 'households', householdId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setHouseholdName(docSnap.data().familyName || 'Minha Família');
                }
            } catch (error) {
                console.error("Erro ao buscar nome da household:", error);
            } finally {
                setHouseholdLoading(false);
            }
        };

        fetchHouseholdName();
    }, [householdId]);

    const handleUpdateHouseholdName = async (e) => {
        e.preventDefault();
        if (!householdId || householdName.trim() === '') {
            alert("O nome da Família não pode estar vazio.");
            return;
        }

        setHouseholdLoading(true);
        try {
            const docRef = doc(db, 'households', householdId);
            await updateDoc(docRef, { name: householdName.trim() });
            alert('Nome da Família atualizado com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar nome da household:", error);
            alert('Falha ao atualizar nome da Família. Tente novamente.');
        } finally {
            setHouseholdLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpdateHouseholdName}>
            <label>Nome da Família:</label>
            <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="Ex: Silva"
                required
                disabled={householdLoading}
            />
            <button type="submit" disabled={householdLoading}>
                {householdLoading ? 'Atualizando...' : 'Atualizar Nome da Família'}
            </button>
        </form>
    );
};

export default HouseholdUpdateForm;