// src/components/ui/forms/AddCategoryForm.jsx

import React, { useState } from 'react';
import useCategories from '../../../hooks/useCategories';
const AddCategoryForm = ({ existingCategories }) => {
    // Usamos o hook para obter a função addCategory
    const { addCategory } = useCategories(); 
    
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        const categoryName = name.trim();        
        setLoading(true);

        // Verifica duplicidade (case-insensitive)
        const exists = existingCategories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (exists) {
            alert(`A categoria "${categoryName}" já existe.`);
            setLoading(false);
            return;
        }

        try {
            // Usa a função do hook para adicionar a categoria
            await addCategory(categoryName);
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
            <button type="submit" disabled={loading || name.trim() === ''}>
                {loading ? 'Adicionando...' : 'Adicionar Categoria'}
            </button>
        </form>
    );
};

export default AddCategoryForm;