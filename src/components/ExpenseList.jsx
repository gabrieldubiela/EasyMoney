import React from 'react';
import ExpenseItem from './ExpenseItem';

const ExpenseList = ({ expenses }) => {

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhuma despesa encontrada. Adicione a primeira!</p>
      </div>
    );
  }

  return (
    <div className="expenses-list">
      {expenses.map((expense) => (
        <ExpenseItem 
          key={expense.id} 
          expense={expense} 
          userName={expense.userName} 
        />
      ))}
    </div>
  );
};

export default ExpenseList;