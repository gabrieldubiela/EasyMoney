// src/components/ui/TransactionItem.jsx (ATUALIZADO)

import React from 'react';
import { useHousehold } from '../../../hooks/useHousehold';
import { db } from '../../../firebase/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
// Importaremos o hook de navegação (Ex: useNavigate do React Router) no futuro
// import { useNavigate } from 'react-router-dom'; 

// Aceita os novos props com os nomes já mapeados e prontos para exibição
const TransactionItem = ({ transaction, userName, categoryName, typeName }) => {
    // const navigate = useNavigate(); // Descomentar ao instalar o React Router
    const { householdId } = useHousehold(); 
    
    // Lógica para Formatação de Data: Agora usamos o objeto Date do Firestore
    const transactionDate = transaction.date?.toDate().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }) || 'Data Desconhecida';

    // Lógica de Formatação de Valor (igual à sua)
    const formattedAmount = (transaction.amount || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    // Função para navegar para edição
    const handleEditClick = (e) => {
        // Impede que o clique no botão de Excluir também edite
        if (e.target.tagName === 'BUTTON') return; 
        
        // No futuro, isso seria: navigate(`/transactions/${transaction.id}`);
        alert(`Simulando Navegação para Edição da Parcela ${transaction.installments_current}/${transaction.installments_total} (ID: ${transaction.id})`);
    };

    // Função de exclusão (idêntica à sua, que está excelente!)
    const handleDelete = async () => {
        if (!householdId || !transaction.id) {
            console.error("Household ID ou transaction ID faltando para a exclusão.");
            return;
        }
        
        if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
            try {
                const transactionDocRef = doc(db, `households/${householdId}/transactions`, transaction.id);
                await deleteDoc(transactionDocRef);
                console.log(`Despesa ${transaction.id} excluída com sucesso!`);
            } catch (error) {
                console.error('Erro ao excluir despesa:', error);
                alert('Erro ao excluir despesa. Tente novamente.');
            }
        }
    };


    return (
        <div className="transaction-item" onClick={handleEditClick}>
            <div className="transaction-item-header">
                <div>
                    <div className="transaction-item-description">
                        {transaction.description}
                        {transaction.supplier && <span className="transaction-item-supplier"> ({transaction.supplier})</span>}
                    </div>
                </div>
                <div className={`transaction-item-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                    {formattedAmount}
                </div>
            </div>

            <div className="transaction-item-details">
                <span className="transaction-item-date">{transactionDate}</span>
                {transaction.installments_total > 1 && (
                    <span className="transaction-item-installments">
                        Parc. {transaction.installments_current}/{transaction.installments_total}
                    </span>
                )}
            </div>

            <div className="transaction-item-meta">
                <span className="transaction-item-category">Categoria: {categoryName}</span>
                <span className="transaction-item-type">Tipo: {typeName}</span>
            </div>

            <div className="transaction-item-footer">
                <span className="transaction-item-user">Adicionado por: {userName}</span>
                <div className="transaction-item-actions">
                    <button onClick={handleDelete} className="danger btn-sm">
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionItem;