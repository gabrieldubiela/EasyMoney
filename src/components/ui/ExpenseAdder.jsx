import React, { useState } from 'react';
// Importa o formulário principal, agora renomeado para ExpenseForm
import ExpenseForm from './forms/ExpenseForm'; 

const ExpenseAdder = () => {
    // Estado para controlar se o formulário está visível
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Função de alternância (toggle)
    const handleToggleForm = () => {
        setIsFormVisible(!isFormVisible);
    };
    
    // Função chamada pelo ExpenseForm quando uma adição é bem-sucedida.
    const handleSaveSuccess = () => {
        // Fechamos o formulário após um breve atraso para que o usuário veja a confirmação de sucesso
        setTimeout(() => {
            setIsFormVisible(false);
        }, 1500); 
    };

    return (
        <div>
            {isFormVisible ? (
                <>
                    {/* Renderiza o formulário de adição */}
                    {/* Passamos onSaveSuccess para que ele feche após o sucesso */}
                    <ExpenseForm 
                        onSaveSuccess={handleSaveSuccess} 
                        expenseId={null} // Indica que é o modo de Adição
                    /> 
                    
                    {/* Botão para fechar o formulário */}
                    <button 
                        onClick={handleToggleForm}
                    >
                        Fechar Formulário
                    </button>
                </>
            ) : (
                // Botão "adicionar" que aparece quando o formulário está fechado
                <button 
                    onClick={handleToggleForm}
                >
                    + Adicionar Nova Despesa
                </button>
            )}
        </div>
    );
};

export default ExpenseAdder;