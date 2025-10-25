// src/components/tables/BudgetSheet.jsx

import React, { useState, useMemo } from "react";
import useAnnualData from "../../hooks/useAnnualData";
import useAllCategories from "../../hooks/useAllCategories";
import useAllTypes from "../../hooks/useAllTypes";
import "../../styles/tables.css";
import "../../styles/buttons.css";
import "../../styles/lists.css";

// Para facilitar: nomes dos meses
const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

// Célula editável para cada tipo na categoria
const EditableBudgetCell = React.memo(({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    if (inputValue !== value) onSave(inputValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(Number(e.target.value))}
        onBlur={handleSave}
        onKeyDown={e => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setIsEditing(false);
        }}
        autoFocus
        className="editable-cell-input"
    />
    );
  }
  return (
    <span
      className="editable-cell-display"
      onClick={() => setIsEditing(true)}
      title="Clique para editar"
    >
      {value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
    </span>
  );
});

const BudgetSheet = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [editingCategory, setEditingCategory] = useState(null);

  const { annualData, loading: annualDataLoading, error, updateAnnualGoal } = useAnnualData(selectedYear);
  const { categories, loading: loadingCategories } = useAllCategories();
  const { types, loading: loadingTypes } = useAllTypes();

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]
  );
  const typeMap = useMemo(
    () => Object.fromEntries(types.map((t) => [t.id, t.name])), [types]
  );

  // Monta a tabela: cada categoria, cada tipo (mesmo zerado ao editar)
  const sheetData = useMemo(() => {
    if (!annualData.rawAnnualData || categories.length === 0 || types.length === 0) return [];
    return categories.map((cat) => {
      const budgetCat = annualData.rawAnnualData[cat.id] || {};
      const tiposLançados = Object.entries(budgetCat.types || {})
        .filter(([, dat]) => dat.valor > 0)
        .map(([typeId, typeData]) => ({
          typeId,
          valor: typeData.valor || 0
        }));
      const todosTipos = types.map((t) => ({
        typeId: t.id,
        valor: budgetCat.types?.[t.id]?.valor || 0
      }));
      return {
        id: cat.id,
        name: cat.name,
        typesToShow: editingCategory === cat.id ? todosTipos : tiposLançados,
        monthlyActuals: budgetCat.monthlyActuals || Array(12).fill(0),
        budgeted: budgetCat.types
          ? Object.values(budgetCat.types).reduce((a, t) => a + (t.valor || 0), 0)
          : 0,
      };
    });
  }, [annualData.rawAnnualData, categories, types, editingCategory]);

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

  const isLoading = annualDataLoading || loadingCategories || loadingTypes;

  if (isLoading) return <div>Carregando Planilha Anual de Orçamento para {selectedYear}...</div>;
  if (error) return <div className="error-table-row">Erro ao carregar dados: {error}</div>;
  if (sheetData.length === 0) {
    return <div className="empty-table-row">Não há dados de orçamento ou transações para o ano de {selectedYear}.</div>;
  }

  const handleSaveCell = (categoryId, typeId, newValue) => {
    updateAnnualGoal(categoryId, typeId, newValue);
  };

  return (
    <div className="table-wrapper budget-sheet">
      <h2>Planilha de Orçamento Anual - {selectedYear}</h2>
      <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="form-select">
        {Array.from({ length: 5 }, (_, i) => (currentYear - 2) + i).map(y => (
          <option key={y} value={y.toString()}>{y}</option>
        ))}
      </select>
      <table className="table">
        <thead>
          <tr>
            <th>Categoria</th>
            {types.map((t) => <th key={t.id}>{t.name}</th>)}
            {MONTH_NAMES.map((month) => <th key={month}>{month}</th>)}
            <th>Total Realizado</th>
            <th>% Realizado</th>
            <th>Ideal/Mês Restante</th>
            <th>Diferença</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {sheetData.map((row) => {
            const rowTotalActual = row.monthlyActuals.reduce((sum, val) => sum + val, 0);
            const mesesRestantes = 12 - (new Date().getMonth() + 1);
            const idealMesRestante =
              mesesRestantes > 0 ? (row.budgeted - rowTotalActual) / mesesRestantes : 0;
            const percentRealizado = row.budgeted ? (rowTotalActual / row.budgeted) * 100 : 0;
            return (
              <tr key={row.id}>
                <td>{row.name}</td>
                {types.map((t) => {
                  const typeObj = row.typesToShow.find((x) => x.typeId === t.id);
                  return (
                    <td key={t.id}>
                      {typeObj
                        ? (editingCategory === row.id
                          ? <EditableBudgetCell
                            value={typeObj.valor}
                            onSave={val => handleSaveCell(row.id, t.id, val)}
                        />
                          : typeObj.valor > 0
                            ? typeObj.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : "")
                        : (editingCategory === row.id ? (
                          <EditableBudgetCell value={0} onSave={val => handleSaveCell(row.id, t.id, val)}/>
                        ) : "")
                      }
                    </td>
                  );
                })}
                {row.monthlyActuals.map((actual, idx) => (
                  <td key={idx}>
                    {actual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                ))}
                <td>{rowTotalActual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>{Math.round(percentRealizado)}%</td>
                <td>{idealMesRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>{(row.budgeted - rowTotalActual).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>
                  {editingCategory === row.id
                    ? <button className="btn" onClick={() => setEditingCategory(null)}>Salvar</button>
                    : <button className="btn" onClick={() => setEditingCategory(row.id)}>Editar</button>
                  }
                </td>
              </tr>
            );
          })}
          <tr className="table-row--totals">
            <td>TOTAL</td>
            {types.map((t) => <td key={t.id}></td>)}
            {totals.monthlyActuals.map((actual, index) => (
              <td key={index}>
                {actual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
            ))}
            <td>{totals.actual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
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
                  ? ((totals.budgeted - totals.actual) / mesesRestantes).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : (0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
              })()}
            </td>
            <td>{(totals.budgeted - totals.actual).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BudgetSheet;
