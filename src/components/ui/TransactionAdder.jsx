// src/components/ui/TransactionAdder.jsx

import React, { useState } from 'react';
import TransactionForm from '../forms/TransactionForm';
import "../../styles/buttons.css"; 

const TransactionAdder = () => {
  // Estado para controlar se o formulário está visível
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Função de alternância (toggle)
  const handleToggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  // Função chamada pelo TransactionForm quando uma adição é bem-sucedida.
  const handleSaveSuccess = () => {
    setTimeout(() => {
      setIsFormVisible(false);
    }, 1500);
  };

  return (
    <div className="mb-lg">
      {isFormVisible ? (
        <div className="card">
          <TransactionForm
            onSaveSuccess={handleSaveSuccess}
            transactionId={null}
          />
          <button
            onClick={handleToggleForm}
            className="btn btn-secondary btn-block"
            style={{ marginTop: "1.5rem" }}
          >
            Fechar Formulário
          </button>
        </div>
      ) : (
        <button
          onClick={handleToggleForm}
          className="btn btn-primary btn-block"
        >
          + Adicionar Nova Despesa
        </button>
      )}
    </div>
  );
};

export default TransactionAdder;
