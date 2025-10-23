// src/components/ui/BudgetSheet.jsx

import React, { useState, useMemo } from 'react';
import useAnnualData from '../../hooks/useAnnualData';
import useCombinedHouseholdData from '../../hooks/useCombinedHouseholdData';

const MONTH_NAMES = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

// Componente para a célula editável
const EditableBudgetCell = React.memo(({ categoryId, currentGoal, formatBRL, updateAnnualGoal }) => {
    const [isEditing, setIsEditing] = useState(false);
    // Usa o valor do goal atual como estado inicial e para o input
    const [inputValue, setInputValue] = useState(currentGoal);

    const saveGoal = () => {
        // Só atualiza se o valor mudou
        if (inputValue !== currentGoal) {
            updateAnnualGoal(categoryId, inputValue);
        }
        setIsEditing(false); // Sai do modo de edição
    };

    if (isEditing) {
        return (
            <input
                type="number"
                value={inputValue}
                // Garante que o valor seja salvo ao ser digitado
                onChange={(e) => setInputValue(parseFloat(e.target.value))}
                // Salva o valor quando o usuário clica fora
                onBlur={saveGoal}
                // Salva o valor quando o usuário pressiona ENTER
                onKeyDown={(e) => {
                    if (e.key === 'Enter') saveGoal();
                }}
                // Foca automaticamente no campo
                autoFocus
                style={{ width: '90%', textAlign: 'right' }}
            />
        );
    }

    return (
        // Entra no modo de edição ao clicar
        <span onClick={() => setIsEditing(true)}>
            {formatBRL(currentGoal)}
        </span>
    );
});

const BudgetSheet = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());

    const { annualData, loading: annualDataLoading, error, updateAnnualGoal } = useAnnualData(selectedYear);

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

            <table>
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Estimativa Anual</th>
                        {MONTH_NAMES.map(month => <th key={month}>{month}</th>)}
                        <th>Total Realizado</th>
                        <th>% Realizado</th>
                        <th>Ideal/Mês Restante</th>
                        <th>Diferença</th>
                    </tr>
                </thead>
                <tbody>
                    {sheetData.map(row => {
                        const rowTotalActual = row.monthlyActuals.reduce((sum, val) => sum + val, 0);
                        const mesesRestantes = 12 - (new Date().getMonth() + 1); // meses após o mês corrente
                        const idealMesRestante = mesesRestantes > 0 ? (row.budgeted - rowTotalActual) / mesesRestantes : 0;
                        const percentRealizado = row.budgeted ? (rowTotalActual / row.budgeted) * 100 : 0;
                        return (
                            <tr key={row.id}>
                                <td>{row.name}</td>
                                <td>
                                    <EditableBudgetCell
                                        categoryId={row.id}
                                        currentGoal={row.budgeted}
                                        formatBRL={formatBRL}
                                        updateAnnualGoal={updateAnnualGoal}
                                    />
                                </td>
                                {row.monthlyActuals.map((actual, index) => (
                                    <td key={index}>{formatBRL(actual)}</td>
                                ))}
                                <td>{formatBRL(rowTotalActual)}</td>
                                <td>{Math.round(percentRealizado)}%</td>
                                <td>{formatBRL(idealMesRestante)}</td>
                                <td>{formatBRL(row.budgeted - rowTotalActual)}</td>
                            </tr>
                        );
                    })}
                    {/* Linha de Totais */}
                    <tr style={{ fontWeight: 'bold', borderTop: '2px solid black' }}>
                        <td>TOTAL</td>
                        <td>{formatBRL(totals.budgeted)}</td>
                        {totals.monthlyActuals.map((actual, index) => (
                            <td key={index}>{formatBRL(actual)}</td>
                        ))}
                        <td>{formatBRL(totals.actual)}</td>
                        <td>
                            {totals.budgeted
                                ? Math.round((totals.actual / totals.budgeted) * 100)
                                : 0
                            }%
                        </td>
                        <td>
                            {(() => {
                                const mesesRestantes = 12 - (new Date().getMonth() + 1);
                                return mesesRestantes > 0
                                    ? formatBRL((totals.budgeted - totals.actual) / mesesRestantes)
                                    : formatBRL(0);
                            })()}
                        </td>
                        <td>{formatBRL(totals.budgeted - totals.actual)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default BudgetSheet;