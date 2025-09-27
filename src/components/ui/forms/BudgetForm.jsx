// src/components/ui/forms/BudgetForm.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, getDocs } from 'firebase/firestore'; 
import { useHousehold } from '../../../hooks/useHousehold';

const BudgetForm = ({ onSaveSuccess }) => { 
    const { householdId, user } = useHousehold();
    const currentYear = new Date().getFullYear().toString();
    
    // Estados do Formulário
    const [category, setCategory] = useState('');
    const [year, setYear] = useState(currentYear);
    const [annualEstimate, setAnnualEstimate] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Estados de Metadados
    const [categories, setCategories] = useState([]);
    
    // Gera uma lista de anos para o select
    const yearsList = Array.from({ length: 5 }, (_, i) => (currentYear - 2) + i).map(y => y.toString());

    // Busca Categorias (somente o essencial)
    useEffect(() => {
        if (!householdId) { 
            setLoading(false); 
            return; 
        }
        
        const catRef = collection(db, `households/${householdId}/categories`);
        const unsubCat = onSnapshot(catRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setCategories(list);
            setLoading(false);
        });

        return () => unsubCat(); 
    }, [householdId]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const estimateValue = parseFloat(annualEstimate);
        
        // 1. Validação
        if (!householdId || !category || !year || isNaN(estimateValue) || estimateValue <= 0) {
            alert("Por favor, selecione uma Categoria, um Ano e insira um Valor Estimado positivo.");
            return;
        }

        setLoading(true);

        try {
            // 2. Verifica se o orçamento já existe (para evitar duplicatas)
            const budgetsRef = collection(db, `households/${householdId}/budgets`);
            const q = query(
                budgetsRef,
                where('category_id', '==', category),
                where('year', '==', parseInt(year))
            );
            const existingBudgets = await getDocs(q);
            
            if (existingBudgets.size > 0) {
                // Se existir, sugere editar
                alert("Já existe um orçamento para esta Categoria e Ano. Por favor, edite o registro existente ou escolha outro.");
                setLoading(false);
                return;
            }

            // 3. Adiciona o novo orçamento
            await addDoc(budgetsRef, { 
                category_id: category,
                year: parseInt(year), // Salva como número para filtros
                annual_estimate: estimateValue, 
                user_id: user.uid,
                createdAt: serverTimestamp()
            });

            alert(`Orçamento de R$${estimateValue.toFixed(2)} para ${year} na categoria ${categories.find(c => c.id === category)?.name} salvo com sucesso!`);
            
            // Limpa o formulário
            setAnnualEstimate('');
            setCategory('');
            
            if (onSaveSuccess) onSaveSuccess();

        } catch (error) {
            console.error('Erro ao adicionar orçamento:', error);
            alert('Falha ao adicionar orçamento.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Carregando categorias...</div>;
    
    if (categories.length === 0) {
        return <div>Configure **Categorias** para lançar orçamentos.</div>;
    }

    // JSX do formulário
    return (
        <form onSubmit={handleSubmit}> 
            <h3>Adicionar Orçamento Anual</h3>
            
            {/* SELECT DE CATEGORIA */}
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="" disabled>Selecione a Categoria *</option>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            
            {/* SELECT DE ANO */}
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

            <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
        </form>
    );
};

export default BudgetForm;