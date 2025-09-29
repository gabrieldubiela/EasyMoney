// src/components/ui/AnnualBudgetSheet.jsx

import React, { useState, useMemo } from 'react';
import useAnnualData from '../../hooks/useAnnualData';
// NOVO: Importa o hook combinado para obter metadados otimizados
import useCombinedHouseholdData from '../../hooks/useCombinedHouseholdData';

const MONTH_NAMES = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

// REMOVIDO: O hook 'useCategories' interno foi completamente removido.

const AnnualBudgetSheet = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    
    const { annualData, loading: annualDataLoading, error } = useAnnualData(selectedYear);
    
    // NOVO: Utiliza o hook centralizado para obter um mapa de categorias
    const { categoryMap, loading: metadataLoading } = useCombinedHouseholdData();

    const formatBRL = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency', currency: 'BRL', minimumFractionDigits: 2,
        }).format(value || 0);
    };

    const sheetData = useMemo(() => {
        if (!annualData.rawAnnualData || Object.keys(categoryMap).length === 0) return [];
        
        return Object.entries(annualData.rawAnnualData).map(([categoryId, data]) => ({
            id: categoryId,
            name: categoryMap[categoryId]?.name || 'Categoria Desconhecida',
            ...data,
        }));
    }, [annualData.rawAnnualData, categoryMap]);
    
    const totals = useMemo(() => {
        const initialTotals = { budgeted: 0, actual: 0, monthlyActuals: Array(12).fill(0) };
        return sheetData.reduce((acc, row) => {
            acc.budgeted += row.budgeted;
            const totalActualForRow = row.monthlyActuals.reduce((sum, val) => sum + val, 0);
            acc.actual += totalActualForRow;
            row.monthlyActuals.forEach((actual, index) => {
                acc.monthlyActuals[index] += actual;
            });
            return acc;
        }, initialTotals);
    }, [sheetData]);

    const isLoading = annualDataLoading || metadataLoading;

    if (isLoading) return <div>Carregando Planilha Anual de Orçamento para {selectedYear}...</div>;
    if (error) return <div>Erro ao carregar dados: {error}</div>;
    if (sheetData.length === 0) {
        return <div>Não há dados de orçamento ou transações para o ano de {selectedYear}.</div>;
    }

    return (
        <div>
            <h2>Planilha de Orçamento Anual - {selectedYear}</h2>

            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {Array.from({ length: 5 }, (_, i) => (currentYear - 2) + i).map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                ))}
            </select>

            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Orçado (Anual)</th>
                        {MONTH_NAMES.map(month => <th key={month}>{month}</th>)}
                        <th>Total Real</th>
                        <th>Diferença</th>
                    </tr>
                </thead>
                <tbody>
                    {sheetData.map(row => {
                        const rowTotalActual = row.monthlyActuals.reduce((sum, val) => sum + val, 0);
                        return (
                            <tr key={row.id}>
                                <td>{row.name}</td>
                                <td>{formatBRL(row.budgeted)}</td>
                                {row.monthlyActuals.map((actual, index) => (
                                    <td key={index}>{formatBRL(actual)}</td>
                                ))}
                                <td>{formatBRL(rowTotalActual)}</td>
                                <td>{formatBRL(row.budgeted + rowTotalActual)}</td>
                            </tr>
                        );
                    })}
                    {/* Linha de Totais */}
                    <tr style={{fontWeight: 'bold', borderTop: '2px solid black'}}>
                        <td>TOTAL GERAL</td>
                        <td>{formatBRL(totals.budgeted)}</td>
                        {totals.monthlyActuals.map((actual, index) => (
                            <td key={index}>{formatBRL(actual)}</td>
                        ))}
                        <td>{formatBRL(totals.actual)}</td>
                        <td>{formatBRL(totals.budgeted + totals.actual)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default AnnualBudgetSheet;