// src/pages/BalancePage.jsx

import React, { useState, useEffect } from 'react';
import useBalance from '../hooks/useBalance';
import { useAppContext } from '../context/useAppContext';
import { createOrUpdateMonthClosing, getMonthClosing } from '../services/monthClosingService';
import MonthlySummary from '../components/charts/MonthlySummary';
import TransactionForm from '../components/forms/TransactionForm';
import TransactionItem from '../components/ui/TransactionItem';
import ToastMessage from '../components/ui/ToastMessage';
import formatMonth from "../utils/formatMonth";

export default function BalancePage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [busy, setBusy] = useState(false);
  const yearMonthSelected = `${year}${String(month).padStart(2, '0')}`;

  // Dados do mês atual (selecionado)
  const {
    plannedTransactions,
    incomeEffective,
    expenseEffective,
    incomePlanned,
    expensePlanned,
    netEffective,
    categories,
    types,
    loading,
    refetch,
  } = useBalance(year, month);

  // Toast/Notificações
  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => setToast({ type, message: msg });

  // Utilitários de nome
  const getCategoryName = (categoryId) =>
    categories.find(c => c.id === categoryId)?.name || 'N/A';
  const getTypeName = (typeId) =>
    types.find(t => t.id === typeId)?.name || 'N/A';

  // Projeção final do mês
  const projectedBalance = (netEffective || 0) + (incomePlanned || 0) + (expensePlanned || 0);

  // Status de fechamento do mês selecionado
  const { householdId } = useAppContext();
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [monthClosed, setMonthClosed] = useState(false);

  useEffect(() => {
    async function fetchMonthStatus() {
      setLoadingStatus(true);
      if (householdId && yearMonthSelected) {
        const closingObj = await getMonthClosing(householdId, yearMonthSelected);
        setMonthClosed(closingObj?.isClosed === true);
      }
      setLoadingStatus(false);
    }
    fetchMonthStatus();
  }, [householdId, yearMonthSelected, toast]); // toast inclui o recarregamento após ação

  // Botão único para fechar ou reabrir
  const handleToggleMonthClosing = async () => {
    setBusy(true);
    try {
      await createOrUpdateMonthClosing(householdId, yearMonthSelected, {
        totalIncome: incomeEffective ?? 0,
        totalExpense: expenseEffective ?? 0,
        netBalance: netEffective ?? 0,
        isClosed: !monthClosed // Alterna status!
      });
      showToast(
        "success",
        !monthClosed
          ? `Mês ${formatMonth(month)}/${year} fechado!`
          : `Mês ${formatMonth(month)}/${year} reaberto!`
      );
      refetch && refetch();
      setMonthClosed(!monthClosed);
    } catch (err) {
      showToast("danger", "Erro ao atualizar mês: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="balance-page-container">
      <h1>Balanço e Planejamento Mensal</h1>

      {/* Seleção de Período */}
      <div className="balance-period-selector">
        <label htmlFor="month-select">Mês:</label>
        <select
          id="month-select"
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) =>
            <option key={i + 1} value={i + 1}>
              {formatMonth(i)}
            </option>
          )}
        </select>
        <label htmlFor="year-input">Ano:</label>
        <input
          id="year-input"
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
        />
      </div>

      {/* Botão único de fechamento/reabertura */}
      <div className="month-closing-actions">
        <button
          className={`btn ${monthClosed ? "btn-warning" : "btn-success"}`}
          onClick={handleToggleMonthClosing}
          disabled={busy || loadingStatus}
        >
          {busy
            ? (monthClosed ? "Reabrindo..." : "Fechando...")
            : (monthClosed
                ? "Abrir mês"
                : "Fechar mês")
          }
        </button>
      </div>

      {/* Resumo sintético */}
      <MonthlySummary
        balance={netEffective}
        totalIncome={incomeEffective}
        totalExpense={expenseEffective}
        projectedBalance={projectedBalance}
      />

      {/* Formulário Unificado para Add/Edit Planejado */}
      <div className="card">
        <h3>Adicionar Transação Planejada</h3>
        <TransactionForm
          isPlanned={true}
          onSaveSuccess={() => { refetch?.(); showToast("success", "Transação planejada criada!"); }}
          transactionId={null}
        />
      </div>

      {/* Lista de Planejadas */}
      <div className="card">
        <h2>Transações Planejadas</h2>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : plannedTransactions.length === 0 ? (
          <p>Nenhuma transação planejada para o período.</p>
        ) : (
          plannedTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              isPlanned={true}
              categoryName={getCategoryName(transaction.category_id)}
              typeName={getTypeName(transaction.type_id)}
              onConvert={() => { refetch?.(); showToast("success", "Transação convertida!"); }}
            />
          ))
        )}
      </div>

      {/* Toasts */}
      {toast && <ToastMessage {...toast} onClose={() => setToast(null)} duration={3500} />}
    </div>
  );
}
