// src/components/ui/forms/BudgetForm.jsx

import React, { useState } from 'react';
import { useHousehold } from '../../../hooks/useHousehold';
// NOVO: Importa o hook de categorias centralizado
import useCategories from '../../../hooks/useCategories'; 
// NOVO: Importa a função de serviço
import { createAnnualBudget } from '../../../services/budgetService';

const BudgetForm = ({ onSaveSuccess }) => { 
    const { householdId, user } = useHousehold();
    const currentYear = new Date().getFullYear().toString();
    
    // NOVO: Busca as categorias usando o hook centralizado
    const { categories, loading: categoriesLoading } = useCategories();
    
    // Estados do Formulário
    const [selectedCategory, setSelectedCategory] = useState('');
    const [year, setYear] = useState(currentYear);
    const [annualEstimate, setAnnualEstimate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const yearsList = Array.from({ length: 5 }, (_, i) => (parseInt(currentYear) - 2) + i).map(y => y.toString());

    // REMOVIDO: O useEffect que buscava categorias foi removido.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // NOVO: Delega a lógica de salvar para o serviço
            await createAnnualBudget({
                householdId,
                userId: user.uid,
                category: selectedCategory,
                year,
                annualEstimate,
            });

            alert(`Orçamento salvo com sucesso!`);
            
            // Limpa o formulário
            setAnnualEstimate('');
            setSelectedCategory('');
            
            if (onSaveSuccess) onSaveSuccess();

        } catch (error) {
            console.error('Erro ao adicionar orçamento:', error);
            alert(`Falha: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (categoriesLoading) return <div>Carregando categorias...</div>;
    
    if (categories.length === 0) {
        return <div>Configure **Categorias** para lançar orçamentos.</div>;
    }

    return (
        <form onSubmit={handleSubmit}> 
            <h3>Adicionar Orçamento Anual</h3>
            
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                <option value="" disabled>Selecione a Categoria *</option>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            
            <select value={year} onChange={(e) => setYear(e.target.value)} required>
                {yearsList.map(y => (<option key={y} value={y}>{y}</option>))}
            </select>

            <input 
                type="number" 
                placeholder="Valor Estimado Anual (Ex: 12000)" 
                value={annualEstimate} 
                onChange={(e) => setAnnualEstimate(e.target.value)} 
                required 
                min="0.01" 
                step="0.01" 
            />

            <button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
        </form>
    );
};

export default BudgetForm;