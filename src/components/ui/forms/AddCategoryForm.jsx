// src/components/ui/AddCategoryForm.jsx

import React, { useState } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useHousehold } from '../../../context/useHousehold';

const AddCategoryForm = ({ categories }) => {
    const { householdId } = useHousehold();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        const categoryName = name.trim();
        if (!categoryName || !householdId) return;
        
        setLoading(true);

        // Verifica duplicidade (case-insensitive)
        const exists = categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (exists) {
            alert(`A categoria "${categoryName}" já existe.`);
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, `households/${householdId}/categories`), {
                name: categoryName,
                createdAt: serverTimestamp()
            });

            setName('');
        } catch (error) {
            console.error('Erro ao adicionar categoria:', error);
            alert('Falha ao adicionar categoria. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleAdd}>
            <input
                type="text"
                placeholder="Nome da Nova Categoria (Ex: Alimentação)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar Categoria'}
            </button>
        </form>
    );
};

export default AddCategoryForm;