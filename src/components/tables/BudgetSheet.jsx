import React, { useState, useMemo } from "react";
import useAnnualData from "../../hooks/useAnnualData";
import useAllCategories from "../../hooks/useAllCategories";
import useAllTypes from "../../hooks/useAllTypes";
import formatCurrencyInput from "../../utils/formatCurrencyInput";
import "../../styles/tables.css";
import "../../styles/buttons.css";
import "../../styles/lists.css";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Célula editável de orçamento por tipo
 */
const EditableBudgetCell = React.memo(({ value, onSave, isEditing }) => {
  const [isEditingCell, setIsEditingCell] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    const strNum = (Math.round((value ?? 0) * 100)).toString();
    return formatCurrencyInput(strNum).masked;
  });

  // Mantém inputValue em sincronia com value da prop
  React.useEffect(() => {
    const strNum = (Math.round((value ?? 0) * 100)).toString();
    setInputValue(formatCurrencyInput(strNum).masked);
  }, [value]);

  const handleInputChange = (e) => {
    const { masked } = formatCurrencyInput(e.target.value);
    setInputValue(masked);
  };

  const handleSave = () => {
    const { float } = formatCurrencyInput(inputValue);
    if (float !== value) onSave(float);
    setIsEditingCell(false);
  };

  if (isEditing && isEditingCell) {
    return (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleSave}
        onKeyDown={e => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setIsEditingCell(false);
        }}
        autoFocus
        className="editable-cell-input"
      />
    );
  }
  // Visualização somente leitura com máscara
  return (
    <span
      className={isEditing ? "editable-cell-input" : ""}
      onClick={isEditing ? () => setIsEditingCell(true) : undefined}
      title={isEditing ? "Clique para editar" : undefined}
    >
      {formatCurrencyInput(Math.round((value ?? 0) * 100).toString()).masked}
    </span>
  );

});

/**
 * Planilha anual com exibição dos tipos como linhas dentro das categorias
 */
const BudgetSheet = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [isEditing, setIsEditing] = useState(false);

  // Estado local para update otimista durante edição
  const [editingTableData, setEditingTableData] = useState(null);

  // Busca dados necessários
  const { annualData, loading: annualDataLoading, error, updateAnnualGoal, refreshAnnualData } = useAnnualData(selectedYear);
  const { categories, loading: loadingCategories } = useAllCategories();
  const { types, loading: loadingTypes } = useAllTypes();

  /**
   * Monta a estrutura da tabela original (dados do backend)
   */
  const tableData = useMemo(() => {
    if (!annualData.rawAnnualData || categories.length === 0 || types.length === 0) return [];
    return categories.map(cat => {
      const dataForCat = annualData.rawAnnualData[cat.id] || { types: {} };
      // Para cada tipo, monta a linha
      const typesList = types.map(type => {
        return {
          typeId: type.id,
          typeName: type.name,
          value: dataForCat.types?.[type.id]?.valor || 0
        };
      });
      return {
        id: cat.id,
        name: cat.name,
        typesRows: isEditing ? typesList : typesList.filter(t => t.value > 0),
        monthlyActuals: dataForCat.monthlyActuals || Array(12).fill(0)
      };
    });
  }, [annualData.rawAnnualData, categories, types, isEditing]);

  // Controla qual dados usar para renderizar (durante edição usa local, fora usa backend)
  React.useEffect(() => {
    if (!isEditing) {
      setEditingTableData(null); // Saiu do modo edição: limpa shadow
    } else {
      setEditingTableData(tableData); // Entrou: popula shadow
    }
  }, [isEditing, tableData]);

  // Dados para renderizar: local durante edição, global fora da edição
  const renderTableData = isEditing ? (editingTableData || tableData) : tableData;

  // Calcula totais globais da tabela
  const totals = useMemo(() => {
    let totalBudgeted = 0;
    let totalActual = 0;
    let totalsMonthlyActuals = Array(12).fill(0);

    renderTableData.forEach(cat => {
      cat.typesRows.forEach(type => { totalBudgeted += type.value; });
      const real = cat.monthlyActuals.reduce((sum, v) => sum + v, 0);
      totalActual += real;
      cat.monthlyActuals.forEach((v, idx) => {
        totalsMonthlyActuals[idx] += v;
      });
    });

    return {
      totalBudgeted,
      totalActual,
      totalsMonthlyActuals
    };
  }, [renderTableData]);

  const isLoading = annualDataLoading || loadingCategories || loadingTypes;

  if (isLoading)
    return <div>Loading Annual Budget Sheet for {selectedYear}...</div>;
  if (error)
    return <div className="error-table-row">Error loading data: {error}</div>;
  if (renderTableData.length === 0) {
    return <div className="empty-table-row">No budget or transaction data for year {selectedYear}.</div>;
  }

  // Handler de salvar célula com update otimista
  const handleSaveCell = async (categoryId, typeId, newValue) => {
    // Salva no banco primeiro
    await updateAnnualGoal(categoryId, typeId, newValue);

    // Update otimista: atualiza estado local para mostrar valor imediatamente
    setEditingTableData(prevData => {
      if (!prevData) return prevData;
      return prevData.map(cat => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          typesRows: cat.typesRows.map(type =>
            type.typeId === typeId ? { ...type, value: newValue } : type
          )
        };
      });
    });
  };

  // Handler do botão Edit/Save
  const handleEditToggle = () => {
    const wasEditing = isEditing;
    setIsEditing(!isEditing);

    // Se estava editando e agora vai sair do modo edição, força refresh dos dados do backend
    if (wasEditing) {
      refreshAnnualData();
    }
  };

  return (
    <div className="table-wrapper budget-sheet">
      <h2>Annual Budget Sheet</h2>
      <div className="app-header">
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="form-select"
        >
          {Array.from({ length: 5 }, (_, i) => (currentYear - 2) + i).map(y => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>
        <button
          className="btn"
          onClick={handleEditToggle}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Type</th>
            <th>Budgeted</th>
            {MONTH_NAMES.map((month) => <th key={month}>{month}</th>)}
            <th>Total Actual</th>
            <th>% Realized</th>
            <th>Goal/Month</th>
          </tr>
        </thead>
        <tbody>
          {renderTableData.map(category => {
            const rowSpan = category.typesRows.length || 1;
            const totalActualForCat = category.monthlyActuals.reduce((sum, val) => sum + val, 0);

            return category.typesRows.length === 0 ? (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td colSpan={MONTH_NAMES.length + 5}>Não foi definido orçamento</td>
              </tr>
            ) : (
              category.typesRows.map((type, idx) => {
                const percentRealized = type.value ? (totalActualForCat / type.value) * 100 : 0;
                const monthsLeft = 12 - (new Date().getMonth() + 1);
                const goalPerMonth = monthsLeft > 0 ? (type.value - totalActualForCat) / monthsLeft : 0;

                return (
                  <tr key={category.id + "-" + type.typeId}>
                    {idx === 0 && (
                      <td rowSpan={rowSpan}>{category.name}</td>
                    )}
                    <td>{type.typeName}</td>
                    <td>
                      <EditableBudgetCell
                        value={type.value}
                        onSave={val => handleSaveCell(category.id, type.typeId, val)}
                        isEditing={isEditing}
                      />
                    </td>
                    {category.monthlyActuals.map((actual, idxMonth) => (
                      <td key={idxMonth}>
                        {formatCurrencyInput(Math.round((actual ?? 0) * 100).toString()).masked}
                      </td>
                    ))}
                    <td>{formatCurrencyInput(Math.round((totalActualForCat ?? 0) * 100).toString()).masked}</td>
                    <td>{Math.round(percentRealized)}%</td>
                    <td>
                      {formatCurrencyInput(Math.round((goalPerMonth ?? 0) * 100).toString()).masked}
                    </td>
                  </tr>
                );
              })
            )
          })}
          <tr className="table-row--totals">
            <td>TOTAL</td>
            <td></td>
            <td>
              {formatCurrencyInput(Math.round((totals.totalBudgeted ?? 0) * 100).toString()).masked}
            </td>
            {totals.totalsMonthlyActuals.map((actual, idx) => (
              <td key={idx}>
                {formatCurrencyInput(Math.round((actual ?? 0) * 100).toString()).masked}
              </td>
            ))}
            <td>{formatCurrencyInput(Math.round((totals.totalActual ?? 0) * 100).toString()).masked}</td>
            <td>
              {totals.totalBudgeted
                ? Math.round((totals.totalActual / totals.totalBudgeted) * 100)
                : 0
              }%
            </td>
            <td>
              {(() => {
                const monthsLeft = 12 - (new Date().getMonth() + 1);
                return formatCurrencyInput(Math.round(
                  (monthsLeft > 0
                    ? ((totals.totalBudgeted - totals.totalActual) / monthsLeft)
                    : 0) * 100
                ).toString()).masked;
              })()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BudgetSheet;
