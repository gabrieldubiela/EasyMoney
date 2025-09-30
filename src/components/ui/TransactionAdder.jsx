import React, { useState } from 'react';
// Importa o formulário principal, agora renomeado para TransactionForm
import TransactionForm from './forms/TransactionForm'; 

const TransactionAdder = () => {
    // Estado para controlar se o formulário está visível
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Função de alternância (toggle)
    const handleToggleForm = () => {
        setIsFormVisible(!isFormVisible);
    };
    
    // Função chamada pelo TransactionForm quando uma adição é bem-sucedida.
    const handleSaveSuccess = () => {
        // Fechamos o formulário após um breve atraso para que o usuário veja a confirmação de sucesso
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
                        className="secondary btn-block mt-md"
                    >
                        Fechar Formulário
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleToggleForm}
                    className="primary btn-block"
                >
                    + Adicionar Nova Despesa
                </button>
            )}
        </div>
    );
};

export default TransactionAdder;