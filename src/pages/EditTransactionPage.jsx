// src/components/pages/EditTransactionPage.jsx

import React from 'react';
import TransactionForm from '../ui/TransactionForm'; 
import { useHousehold } from '../../context/useHousehold';

// Simulando a obtenção do ID da URL (necessário React Router no futuro)
const EditTransactionPage = ({ transactionId }) => { 
    const { householdName } = useHousehold();
    
    // Se estivéssemos usando React Router, faríamos:
    // const { id } = useParams(); 
    // const transactionId = id; 

    if (!transactionId) {
        return <div>Erro: ID da despesa não fornecido.</div>;
    }

    return (
        <div>
            <h1>Editar Despesa (Família: {householdName})</h1>
            {/* Passa o ID para o formulário para que ele carregue os dados */}
            <TransactionForm transactionId={transactionId} />
        </div>
    );
};

export default EditTransactionPage;