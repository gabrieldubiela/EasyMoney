// src/components/ui/AddCategoryForm.jsx (ATUALIZADO)

import React, { useState } from 'react';
import useCategories from '../../hooks/useCategories'; // Importa o hook para a função addCategory

// Recebemos a lista de TIPOS do useTypes e a lista de CATEGORIAS para checagem de duplicidade
const AddCategoryForm = ({ existingCategories, types }) => {
    // Usamos o hook para obter a função addCategory
    const { addCategory } = useCategories(); 
    
    const [name, setName] = useState('');
    const [selectedTypeId, setSelectedTypeId] = useState(''); // NOVO: Estado para o ID do Tipo
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        const categoryName = name.trim();
        
        // Verifica dados essenciais
        if (!categoryName || !selectedTypeId) return;
        
        setLoading(true);

        // Verifica duplicidade (case-insensitive)
        const exists = existingCategories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (exists) {
            alert(`A categoria "${categoryName}" já existe.`);
            setLoading(false);
            return;
        }

        try {
            // Usa a função do hook para adicionar a categoria com o typeId
            await addCategory(categoryName, selectedTypeId);

            setName('');
            setSelectedTypeId('');
        } catch (error) {
            console.error('Erro ao adicionar categoria:', error);
            alert('Falha ao adicionar categoria. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
                type="text"
                placeholder="Nome da Nova Categoria (Ex: Alimentação)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            
            {/* NOVO: Campo de Seleção de Tipo */}
            <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                required
                disabled={types.length === 0}
            >
                <option value="">Selecione o Tipo *</option>
                {/* Mapeia os Tipos para criar as opções */}
                {types.map(type => (
                    <option key={type.id} value={type.id}>
                        {type.name} ({type.isIncome ? 'Receita' : 'Despesa'})
                    </option>
                ))}
            </select>

            <button type="submit" disabled={loading || types.length === 0}>
                {loading ? 'Adicionando...' : 'Adicionar Categoria'}
            </button>
            {types.length === 0 && <p style={{color: 'red'}}>Crie um Tipo primeiro!</p>}
        </form>
    );
};

export default AddCategoryForm;