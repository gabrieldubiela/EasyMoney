// src/components/ui/PlannedExpenseItem.jsx

import React from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { doc, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'; 
import { useHousehold } from '../../../context/useHousehold';

// Recebe a despesa, metadados e uma função de callback para atualizar a lista
const PlannedExpenseItem = ({ expense, categoryName, typeName, onConvert }) => {
    const { householdId, user } = useHousehold();

    // Função auxiliar para formatar a data
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return dateObj.toLocaleDateString('pt-BR');
    };

    // Lógica para Converter Despesa Planejada em Despesa Efetiva
    const handleConvert = async () => {
        if (!window.confirm(`Tem certeza que deseja converter a despesa "${expense.description}" (R$${expense.amount.toFixed(2)}) para despesa efetiva (PAGA)?`)) {
            return;
        }

        try {
            // 1. Prepara dados para a Despesa Efetiva
            const expenseDate = expense.paymentDate.toDate().toISOString().substring(0, 10);
            const startDate = new Date(expenseDate + 'T00:00:00'); 
            const yearMonthIndex = startDate.getFullYear().toString() + String(startDate.getMonth() + 1).padStart(2, '0');

            // 2. Cria a Despesa Efetiva (na coleção 'expenses')
            await addDoc(collection(db, `households/${householdId}/expenses`), {
                description: expense.description,
                amount: expense.amount, 
                category_id: expense.category_id,
                type_id: expense.type_id,
                date: expense.paymentDate, // Usa a data planeada como data de pagamento
                installments_total: 1,
                installments_current: 1, 
                user_id: user.uid,
                yearMonth: yearMonthIndex,
                transactionId: expense.id, 
                createdAt: serverTimestamp()
            });

            // 3. Deleta a Despesa Planejada (da coleção 'plannedExpenses')
            await deleteDoc(doc(db, `households/${householdId}/plannedExpenses`, expense.id));
            
            alert(`Despesa "${expense.description}" convertida e paga com sucesso!`);
            if(onConvert) onConvert(); // Atualiza a página

        } catch (error) {
            console.error('Erro ao converter despesa:', error);
            alert('Falha ao converter a despesa planejada.');
        }
    };
    
    // Lógica para Apagar Despesa Planejada
    const handleDelete = async () => {
        if (!window.confirm(`Tem certeza que deseja APAGAR a despesa planejada "${expense.description}"?`)) {
            return;
        }
        try {
            await deleteDoc(doc(db, `households/${householdId}/plannedExpenses`, expense.id));
            alert(`Despesa "${expense.description}" apagada.`);
            if(onConvert) onConvert(); // Atualiza a página
        } catch (error) {
            console.error('Erro ao apagar despesa planejada:', error);
            alert('Falha ao apagar despesa planejada.');
        }
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <strong>{expense.description}</strong> - R$ {expense.amount.toFixed(2)}
                <p style={{ margin: 0, fontSize: '0.9em' }}>
                    Data Planejada: {formatDate(expense.paymentDate)} | 
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

export default PlannedExpenseItem;