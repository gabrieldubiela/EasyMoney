// src/components/pages/EditExpensePage.jsx

import React from 'react';
import ExpenseForm from '../ui/ExpenseForm'; 
import { useHousehold } from '../../context/useHousehold';

// Simulando a obtenção do ID da URL (necessário React Router no futuro)
const EditExpensePage = ({ expenseId }) => { 
    const { householdName } = useHousehold();
    
    // Se estivéssemos usando React Router, faríamos:
    // const { id } = useParams(); 
    // const expenseId = id; 

    if (!expenseId) {
        return <div>Erro: ID da despesa não fornecido.</div>;
    }

    return (
        <div>
            <h1>Editar Despesa (Família: {householdName})</h1>
            {/* Passa o ID para o formulário para que ele carregue os dados */}
            <ExpenseForm expenseId={expenseId} />
        </div>
    );
};

export default EditExpensePage;