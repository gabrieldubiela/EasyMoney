// src/pages/BalancePage.jsx

import React, { useState } from 'react';
import useBalance from '../hooks/useBalance';
import useMonthClosingStatus from '../hooks/useMonthClosingStatus';
import { useAppContext } from '../context/useAppContext';
import { createOrUpdateMonthClosing } from '../services/monthClosingService';
import MonthlySummary from '../components/charts/MonthlySummary';
import TransactionForm from '../components/forms/TransactionForm';
import TransactionItem from '../components/ui/TransactionItem';
import ToastMessage from '../components/ui/ToastMessage';

export default function BalancePage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

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

  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => setToast({ type, message: msg });

  const getCategoryName = (categoryId) =>
    categories.find(c => c.id === categoryId)?.name || 'N/A';

  const getTypeName = (typeId) =>
    types.find(t => t.id === typeId)?.name || 'N/A';

  // Projeção final do mês
  const projectedBalance = (netEffective || 0) + (incomePlanned || 0) + (expensePlanned || 0);

  // FECHAMENTO DE MÊS: verifica status do mês anterior
  const { needsClosing, loading: closingStatusLoading } = useMonthClosingStatus();
  const { householdId } = useAppContext();
  const [closingInProgress, setClosingInProgress] = useState(false);

  // Busca os dados do mês ANTERIOR para fechamento (cálculo real!)
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const {
    incomeEffective: incomePrev,
    expenseEffective: expensePrev,
    netEffective: netPrev,
    loading: loadingPrev,
  } = useBalance(prevYear, prevMonth);

  // Ação de FECHAR mês anterior: salva os dados reais no fechamento!
  const fecharMesAnterior = async () => {
    setClosingInProgress(true);
    try {
      await createOrUpdateMonthClosing(
        householdId,
        needsClosing.yearMonth,
        {
          totalIncome: incomePrev,
          totalExpense: expensePrev,
          netBalance: netPrev,
          isClosed: true
        }
      );
      showToast("success", `Fechamento do mês ${needsClosing.monthName} realizado!`);
      refetch && refetch();
    } catch (err) {
      showToast("danger", "Erro ao fechar mês: " + err.message);
    } finally {
      setClosingInProgress(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Balanço e Planejamento Mensal</h1>

      {/* Alerta/Botão de fechamento do mês anterior */}
      {!closingStatusLoading && needsClosing && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <strong>O mês {needsClosing.monthName} não foi fechado!</strong>
          <br />
          {needsClosing.hasData
            ? "Você já possui dados de orçamento/resultado; só confirme o fechamento."
            : "Nenhum dado salvo para o mês; ao fechar, não será mais possível criar ou editar transações nele."}
          <br />
          <button
            disabled={closingInProgress || loadingPrev}
            onClick={fecharMesAnterior}
          >
            {(closingInProgress || loadingPrev)
              ? "Fechando..."
              : `Fechar mês ${needsClosing.monthName}`
            }
          </button>
        </div>
      )}

      {/* Seleção de Período */}
      <div style={{ marginBottom: 16 }}>
        <label>Mês: </label>
        <select value={month} onChange={e => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) =>
            <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}</option>
          )}
        </select>
        <label style={{ marginLeft: 14 }}>Ano: </label>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ width: 90 }}
        />
      </div>

      {/* Resumo sintético */}
      <MonthlySummary
        balance={netEffective}
        totalIncome={incomeEffective}
        totalExpense={expenseEffective}
        projectedBalance={projectedBalance}
      />

      {/* Formulário Unificado para Add/Edit Planejado */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Adicionar Planejamento</h3>
        <TransactionForm
          isPlanned={true}
          onSaveSuccess={() => { refetch(); showToast("success", "Transação planejada criada!"); }}
          transactionId={null}
        />
      </div>

      {/* Lista de Planejadas */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Transações Futuras ({plannedTransactions.length})</h2>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : plannedTransactions.length === 0 ? (
          <p>Nenhuma transação planejada para o período.</p>
        ) : (
          plannedTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              categoryName={getCategoryName(transaction.category_id)}
              typeName={getTypeName(transaction.type_id)}
              onConvert={() => { refetch(); showToast("success", "Transação convertida!"); }}
            />
          ))
        )}
      </div>
      
      {/* Toasts */}
      {toast && <ToastMessage {...toast} onClose={() => setToast(null)} duration={3500} />}
    </div>
  );
}
