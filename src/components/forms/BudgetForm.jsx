// src/components/ui/forms/BudgetForm.jsx

import React, { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import useCategories from '../../hooks/useCategories';
import { createAnnualBudget } from '../../services/budgetService';

const BudgetForm = ({ onSaveSuccess }) => { 
    const { householdId, user } = useAppContext();
    const currentYear = new Date().getFullYear().toString();
    const { categories, loading: categoriesLoading } = useCategories();
    
    // Estados do Formulário
    const [selectedCategory, setSelectedCategory] = useState('');
    const [year, setYear] = useState(currentYear);
    const [annualEstimate, setAnnualEstimate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const yearsList = Array.from({ length: 5 }, (_, i) => (parseInt(currentYear) - 2) + i).map(y => y.toString());

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Delega a lógica de salvar para o serviço
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