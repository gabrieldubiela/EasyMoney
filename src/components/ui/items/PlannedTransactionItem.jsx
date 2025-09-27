// src/components/ui/PlannedTransactionItem.jsx

import React from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { doc, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'; 
import { useHousehold } from '../../../hooks/useHousehold';

// Recebe a despesa, metadados e uma função de callback para atualizar a lista
const PlannedTransactionItem = ({ transaction, categoryName, typeName, onConvert }) => {
    const { householdId, user } = useHousehold();

    // Função auxiliar para formatar a data
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return dateObj.toLocaleDateString('pt-BR');
    };

    // Lógica para Converter Despesa Planejada em Despesa Efetiva
    const handleConvert = async () => {
        if (!window.confirm(`Tem certeza que deseja converter a despesa "${transaction.description}" (R$${transaction.amount.toFixed(2)}) para despesa efetiva (PAGA)?`)) {
            return;
        }

        try {
            // 1. Prepara dados para a Despesa Efetiva
            const transactionDate = transaction.paymentDate.toDate().toISOString().substring(0, 10);
            const startDate = new Date(transactionDate + 'T00:00:00'); 
            const yearMonthIndex = startDate.getFullYear().toString() + String(startDate.getMonth() + 1).padStart(2, '0');

            // 2. Cria a Despesa Efetiva (na coleção 'transactions')
            await addDoc(collection(db, `households/${householdId}/transactions`), {
                description: transaction.description,
                amount: transaction.amount, 
                category_id: transaction.category_id,
                type_id: transaction.type_id,
                date: transaction.paymentDate, // Usa a data planeada como data de pagamento
                installments_total: 1,
                installments_current: 1, 
                user_id: user.uid,
                yearMonth: yearMonthIndex,
                transactionId: transaction.id, 
                createdAt: serverTimestamp()
            });

            // 3. Deleta a Despesa Planejada (da coleção 'plannedTransactions')
            await deleteDoc(doc(db, `households/${householdId}/plannedTransactions`, transaction.id));
            
            alert(`Despesa "${transaction.description}" convertida e paga com sucesso!`);
            if(onConvert) onConvert(); // Atualiza a página

        } catch (error) {
            console.error('Erro ao converter despesa:', error);
            alert('Falha ao converter a despesa planejada.');
        }
    };
    
    // Lógica para Apagar Despesa Planejada
    const handleDelete = async () => {
        if (!window.confirm(`Tem certeza que deseja APAGAR a despesa planejada "${transaction.description}"?`)) {
            return;
        }
        try {
            await deleteDoc(doc(db, `households/${householdId}/plannedTransactions`, transaction.id));
            alert(`Despesa "${transaction.description}" apagada.`);
            if(onConvert) onConvert(); // Atualiza a página
        } catch (error) {
            console.error('Erro ao apagar despesa planejada:', error);
            alert('Falha ao apagar despesa planejada.');
        }
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <strong>{transaction.description}</strong> - R$ {transaction.amount.toFixed(2)}
                <p style={{ margin: 0, fontSize: '0.9em' }}>
                    Data Planejada: {formatDate(transaction.paymentDate)} | 
                    Categoria: {categoryName} | 
                    Tipo: {typeName}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                    onClick={handleConvert} 
                    style={{ background: 'green', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                >
                    Converter em Paga
                </button>
                <button 
                    onClick={handleDelete} 
                    style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                >
                    Apagar
                </button>
            </div>
        </div>
    );
};

export default PlannedTransactionItem;