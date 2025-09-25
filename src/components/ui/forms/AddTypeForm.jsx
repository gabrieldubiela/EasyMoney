// src/components/ui/AddTypeForm.jsx

import React, { useState } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useHousehold } from '../../../context/useHousehold';

const AddTypeForm = ({ types }) => {
    const { householdId } = useHousehold();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Futuramente, você pode adicionar um campo 'isCredit' ou 'isCash' aqui.

    const handleAdd = async (e) => {
        e.preventDefault();
        const typeName = name.trim();
        if (!typeName || !householdId) return;
        
        setLoading(true);
        
        // Verifica duplicidade (case-insensitive)
        const exists = types.some(t => t.name.toLowerCase() === typeName.toLowerCase());
        if (exists) {
            alert(`O tipo "${typeName}" já existe.`);
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, `households/${householdId}/types`), {
                name: typeName,
                createdAt: serverTimestamp()
            });

            setName('');
        } catch (error) {
            console.error('Erro ao adicionar tipo:', error);
            alert('Falha ao adicionar tipo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleAdd}>
            <input
                type="text"
                placeholder="Nome do Novo Tipo (Ex: Cartão de Crédito)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar Tipo'}
            </button>
        </form>
    );
};

export default AddTypeForm;