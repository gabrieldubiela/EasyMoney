// src/components/AnnualBudgetSheet.jsx

import React, { useState, useMemo } from 'react';
import useAnnualData from '../../hooks/useAnnualData'; 
// Importe useCategories se você precisar do nome das categorias para o display
import { useHousehold } from '../../context/useHousehold'; 
import { db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore'; 

const MONTH_NAMES = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

// Hook auxiliar para buscar a lista de categorias e nomes
const useCategories = () => {
    const { householdId } = useHousehold();
    const [categoriesMap, setCategoriesMap] = useState({});

    React.useEffect(() => {
        if (!householdId) return;

        const catRef = collection(db, `households/${householdId}/categories`);
        const unsub = onSnapshot(catRef, (snapshot) => {
            const map = {};
            snapshot.docs.forEach(doc => {
                map[doc.id] = doc.data().name;
            });
            setCategoriesMap(map);
        });

        return () => unsub();
    }, [householdId]);

    return categoriesMap;
};


const AnnualBudgetSheet = () => {
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    
    // 1. Hook de Busca de Dados
    const { annualData, loading, error } = useAnnualData(selectedYear);
    
    // 2. Hook de Busca de Categorias (para mapear IDs para Nomes)
    const categoriesMap = useCategories();


    // Formata o valor para BRL
    const formatBRL = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(value);
    };

    // 3. Estrutura de Consolidada para Renderização
    // Usa useMemo para recalcular apenas quando annualData ou categoriesMap mudar
    const sheetData = useMemo(() => {
        const dataArray = Object.entries(annualData).map(([categoryId, data]) => ({
            id: categoryId,
            name: categoriesMap[categoryId] || 'Categoria Desconhecida',
            ...data, // { budgeted: N, monthlyActuals: [N, N, ...] }
        }));
        
        // Separa Receitas (valores orçados positivos) de Despesas (valores orçados negativos)
        // Isso é uma suposição, o BudgetForm salva apenas valores positivos, 
        // mas na Planilha vamos listar todas as categorias que têm dados.
        // Se a categoria for Receita, o total Real será positivo.
        
        return dataArray;
    }, [annualData, categoriesMap]);
    
    // 4. Cálculos de Totais
    const totals = useMemo(() => {
        const initialTotals = { budgeted: 0, actual: 0, monthlyActuals: Array(12).fill(0) };
        
        return sheetData.reduce((acc, row) => {
            acc.budgeted += row.budgeted;
            row.monthlyActuals.forEach((actual, index) => {
                acc.monthlyActuals[index] += actual;
            });
            acc.actual += row.monthlyActuals.reduce((sum, val) => sum + val, 0);
            return acc;
        }, initialTotals);
    }, [sheetData]);


    if (loading) return <div>Carregando Planilha Anual de Orçamento para {selectedYear}...</div>;
    if (error) return <div>Erro ao carregar dados: {error}</div>;

    // Se não houver dados, mas não for erro, sugere adicionar orçamento.
    if (sheetData.length === 0) {
        return <div>Não há dados de orçamento ou transações para o ano de {selectedYear}. Comece adicionando um orçamento.</div>;
    }


    return (
        <div>
            <h2>Planilha de Orçamento Anual - {selectedYear}</h2>

            {/* SELETOR DE ANO */}
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {Array.from({ length: 5 }, (_, i) => (currentYear - 2) + i).map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                ))}
            </select>

            <table>
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Orçado (Anual)</th>
                        {/* Cabeçalho dos meses */}
                        {MONTH_NAMES.map(month => (
                            <th key={month}>{month}</th>
                        ))}
                        <th>Total Real</th>
                        <th>Diferença</th>
                    </tr>
                </thead>
                <tbody>
                    {/* LINHAS DE DADOS (POR CATEGORIA) */}
                    {sheetData.map(row => (
                        <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{formatBRL(row.budgeted)}</td>
                            
                            {/* Valores Reais Mensais */}
                            {row.monthlyActuals.map((actual, index) => (
                                <td key={index} className={actual < 0 ? 'expense' : 'income'}>
                                    {formatBRL(actual)}
                                </td>
                            ))}
                            
                            {/* Total Real e Diferença */}
                            <td>{formatBRL(row.monthlyActuals.reduce((sum, val) => sum + val, 0))}</td>
                            <td>{formatBRL(row.budgeted - row.monthlyActuals.reduce((sum, val) => sum + val, 0))}</td>
                        </tr>
                    ))}

                    {/* LINHA DE TOTAIS */}
                    <tr>
                        <td>**TOTAL GERAL**</td>
                        <td>**{formatBRL(totals.budgeted)}**</td>
                        
                        {/* Totais Mensais Reais */}
                        {totals.monthlyActuals.map((actual, index) => (
                            <td key={index} className={actual < 0 ? 'total-negative' : 'total-positive'}>
                                **{formatBRL(actual)}**
                            </td>
                        ))}
                        
                        {/* Total Real e Diferença Total */}
                        <td>**{formatBRL(totals.actual)}**</td>
                        <td>**{formatBRL(totals.budgeted - totals.actual)}**</td>
                    </tr>
                </tbody>
            </table>
            
            {/* Nota de rodapé para CSS: */}
            <p>Para esta planilha funcionar visualmente, você precisará adicionar regras CSS para <code>.expense</code>, <code>.income</code>, <code>.total-negative</code>, e <code>.total-positive</code>.</p>
        </div>
    );
};

export default AnnualBudgetSheet;