// src/components/ui/forms/MonthlyBudgetForm.jsx

import React, { useState, useEffect } from 'react';
import useCategories from '../../../hooks/useCategories';
import useTypes from '../../../hooks/useTypes';
import useMonthlyBudgetPerformance from '../../../hooks/useMonthlyBudgetPerformance';

// Componente que lida com o input de metas mensais por categoria
const MonthlyBudgetForm = () => {
    // 1. Estados e Dados Iniciais
    const today = new Date();
    const defaultYearMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const [selectedYearMonth, setSelectedYearMonth] = useState(defaultYearMonth);
    
    // Lista de categorias e tipos (apenas para exibição)
    const { categories, loading: categoriesLoading } = useCategories();
    const { types, loading: typesLoading } = useTypes();
    
    // Performance Consolidada (inclui a função de Rollover)
    const { 
        performance, 
        loading: performanceLoading, 
        saveGoalAdjustment,
        closeMonthAndCalculateRollover // Função de Rollover
    } = useMonthlyBudgetPerformance(selectedYearMonth);

    const [goalInputs, setGoalInputs] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // 2. Efeito para preencher o formulário quando os dados de performance carregam
    useEffect(() => {
        const initialInputs = {};
        for (const catId in performance) {
            // Usa a meta ajustada se existir, ou a meta base anual
            initialInputs[catId] = performance[catId].adjustedGoal; 
        }
        setGoalInputs(initialInputs);
    }, [performance]);
    
    // 3. Funções Auxiliares
    const getTypeName = (typeId) => {
        return types.find(t => t.id === typeId)?.name || 'N/A';
    };

    const handleInputChange = (categoryId, value) => {
        const amount = parseFloat(value.replace(',', '.')) || 0;
        setGoalInputs(prev => ({
            ...prev,
            [categoryId]: amount
        }));
    };

    // 4. Lógica de Salvamento dos Ajustes
    const handleSaveAllGoals = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        const savePromises = [];

        for (const categoryId in goalInputs) {
            const newGoalAmount = goalInputs[categoryId];
            const item = performance[categoryId];
            
            if (!item) continue;

            savePromises.push(
                saveGoalAdjustment(categoryId, newGoalAmount, item.monthlyBudgetId)
            );
        }

        try {
            await Promise.all(savePromises);
            alert("Ajustes de metas mensais salvos com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar ajustes:", error);
            alert("Erro ao salvar ajustes. Verifique o console.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // 5. Lógica de Fechamento de Mês (Rollover)
    const handleCloseMonth = async () => {
        // Obter o mês anterior ao atual para checar se estamos fechando o mês correto
        const currentDate = new Date();
        const prevMonth = `${currentDate.getFullYear()}${String(currentDate.getMonth()).padStart(2, '0')}`;
        
        if (selectedYearMonth === prevMonth) {
            alert("Não é recomendado fechar o mês atual. Feche o mês anterior.");
            return;
        }

        if (!window.confirm(`Tem certeza que deseja fechar o orçamento de ${selectedYearMonth} e propagar o Rollover para o próximo mês? Esta ação é geralmente feita no início do mês seguinte.`)) {
            return;
        }
        setIsSaving(true);
        try {
            await closeMonthAndCalculateRollover();
        } catch (e) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };


    // 6. Exibição
    const isLoading = categoriesLoading || typesLoading || performanceLoading;
    
    if (isLoading) {
        return <div>Carregando desempenho orçamentário...</div>;
    }

    const performanceArray = Object.values(performance);
    
    const sortedPerformance = performanceArray.sort((a, b) => {
        const aType = getTypeName(a.typeId);
        const bType = getTypeName(b.typeId);
        if (aType !== bType) return aType.localeCompare(bType);
        return a.categoryName.localeCompare(b.categoryName);
    });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1>Metas Mensais (Ajuste Anual)</h1>

            {/* Seletor de Mês/Ano */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="month-select">Orçamento de: </label>
                <input 
                    type="month"
                    id="month-select"
                    value={`${selectedYearMonth.substring(0, 4)}-${selectedYearMonth.substring(4)}`}
                    onChange={(e) => {
                        const [year, month] = e.target.value.split('-');
                        setSelectedYearMonth(`${year}${month}`);
                    }}
                    style={{ marginLeft: '10px' }}
                />
            </div>

            <form onSubmit={handleSaveAllGoals}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Categoria</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Tipo</th>
                            <th style={{ padding: '8px' }}>Meta Base (Anual/12)</th>
                            <th style={{ padding: '8px' }}>Ajuste Mensal (R$)</th>
                            <th style={{ padding: '8px' }}>Rollover (Mês Ant.)</th>
                            <th style={{ padding: '8px' }}>Total Disponível</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPerformance.map(item => (
                            <tr key={item.categoryId} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>{item.categoryName}</td>
                                <td style={{ padding: '8px' }}>{getTypeName(item.typeId)}</td>
                                
                                <td style={{ textAlign: 'right', padding: '8px', color: '#007bff' }}>
                                    R$ {item.monthlyBaseGoal.toFixed(2)}
                                </td>
                                
                                {/* Campo de AJUSTE */}
                                <td style={{ textAlign: 'center', width: '150px' }}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={goalInputs[item.categoryId] || ''} 
                                        onChange={(e) => handleInputChange(item.categoryId, e.target.value)}
                                        style={{ width: '90%', textAlign: 'right', fontWeight: item.adjustedGoal !== item.monthlyBaseGoal ? 'bold' : 'normal' }}
                                        title={item.adjustedGoal !== item.monthlyBaseGoal ? "Meta ajustada manualmente." : "Meta padrão anual."}
                                    />
                                </td>
                                
                                <td style={{ textAlign: 'right', padding: '8px', color: item.rollover < 0 ? 'red' : 'green' }}>
                                    R$ {item.rollover.toFixed(2)}
                                </td>
                                
                                <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>
                                    R$ {item.totalAvailable.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {/* BOTÃO DE FECHAMENTO */}
                    <button 
                        type="button" 
                        onClick={handleCloseMonth} 
                        disabled={isSaving || categories.length === 0 || performanceLoading}
                        style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        {isSaving ? 'Fechando Mês...' : 'Fechar Mês & Calcular Rollover'}
                    </button>


                    <button type="submit" disabled={isSaving || categories.length === 0 || performanceLoading} style={{ padding: '10px 15px' }}>
                        {isSaving ? 'Salvando Ajustes...' : 'Salvar Ajustes Mensais'}
                    </button>
                </div>
            </form>
            
            {/* Exibir o Gasto Real do Mês */}
            <h2 style={{marginTop: '30px'}}>Performance Real do Mês</h2>
             <ul style={{ listStyle: 'none', padding: 0 }}>
                {sortedPerformance.map(item => (
                    <li key={`real-${item.categoryId}`} style={{ padding: '5px 0', borderBottom: '1px dotted #ccc', color: item.isOverBudget ? 'red' : 'black' }}>
                        **{item.categoryName}** ({getTypeName(item.typeId)}): 
                        Gasto Real: R$ {item.realSpent.toFixed(2)} | 
                        **Restante:** R$ {item.remaining.toFixed(2)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MonthlyBudgetForm;