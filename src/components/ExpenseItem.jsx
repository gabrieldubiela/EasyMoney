// src/components/ExpenseItem.jsx

import React from 'react';
// NOVO: Importa o hook do contexto e as funções do Firestore
import { useHousehold } from '../context/HouseholdContext';
import { db } from '../firebase/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';


const ExpenseItem = ({ expense, userName }) => {
  // NOVO: Obtém o ID da família do Contexto
  const { householdId } = useHousehold(); 

  const formattedAmount = expense.amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const addedBy = userName;

  // NOVO: Função de exclusão vive dentro do ExpenseItem
  const handleDelete = async () => {
    // Validação básica: garante que temos o que precisamos para deletar
    if (!householdId || !expense.id) {
        console.error("Household ID ou Expense ID faltando para a exclusão.");
        return;
    }
    
    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      try {
        // Usa o householdId do Contexto e o expense.id para montar a referência
        const expenseDocRef = doc(db, `households/${householdId}/expenses`, expense.id);
        
        await deleteDoc(expenseDocRef);
        // A lista será atualizada automaticamente pelo onSnapshot no Dashboard
        console.log(`Despesa ${expense.id} excluída com sucesso!`);
        
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        alert('Erro ao excluir despesa. Tente novamente.');
      }
    }
  };


  return (
    <div className="expense-card">
      <p className="expense-description">
        <strong>Descrição:</strong> {expense.description}
      </p>
      <p className="expense-amount">
        <strong>Valor:</strong> {formattedAmount}
      </p>
      <div className="expense-details">
        <p><strong>Fornecedor:</strong> {expense.fornecedor}</p>
        <p><strong>Categoria:</strong> {expense.categoria}</p>
        <p><strong>Data:</strong> {expense.data}</p>
        <p><strong>Tipo:</strong> {expense.tipo}</p>
      </div>
      <p className="expense-meta">
        Adicionado por: {addedBy}
      </p>
      
      {/* NOVO: Botão de Exclusão que chama a função local */}
      <button 
        className="delete-button"
        onClick={handleDelete} 
      >
        Excluir
      </button>
      
    </div>
  );
};

export default ExpenseItem;