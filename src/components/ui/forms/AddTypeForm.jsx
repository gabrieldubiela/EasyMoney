// src/components/ui/AddTypeForm.jsx (ATUALIZADO)

import React, { useState } from 'react';
import useTypes from '../../hooks/useTypes'; // Importa o hook para a função addType

// Recebemos a lista de TIPOS para checagem de duplicidade
const AddTypeForm = ({ existingTypes }) => {
    // Usamos o hook para obter a função addType
    const { addType } = useTypes();
    
    const [name, setName] = useState('');
    const [isIncome, setIsIncome] = useState(false); // NOVO: Estado para a flag de Receita
    const [loading, setLoading] = useState(false);
    
    const handleAdd = async (e) => {
        e.preventDefault();
        const typeName = name.trim();
        if (!typeName) return;
        
        setLoading(true);
        
        // Verifica duplicidade (case-insensitive)
        const exists = existingTypes.some(t => t.name.toLowerCase() === typeName.toLowerCase());
        if (exists) {
            alert(`O tipo "${typeName}" já existe.`);
            setLoading(false);
            return;
        }

        try {
            // Usa a função do hook para adicionar o Tipo com a flag isIncome
            await addType(typeName, isIncome); 

            setName('');
            setIsIncome(false);
        } catch (error) {
            console.error('Erro ao adicionar tipo:', error);
            alert('Falha ao adicionar tipo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
                type="text"
                placeholder="Nome do Novo Tipo (Ex: Essencial, Lazer)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            
            {/* NOVO: Checkbox para Receita */}
            <label>
                <input
                    type="checkbox"
                    checked={isIncome}
                    onChange={(e) => setIsIncome(e.target.checked)}
                />
                É Receita?
            </label>

            <button type="submit" disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar Tipo'}
            </button>
        </form>
    );
};

export default AddTypeForm;