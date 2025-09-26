// src/components/ui/TransactionItem.jsx (ATUALIZADO)

import React from 'react';
import { useHousehold } from '../../../context/useHousehold';
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
        // O container é clicável para edição
        <div onClick={handleEditClick} style={{ cursor: 'pointer', padding: '15px', borderBottom: '1px solid #eee' }}>
            
            {/* Linha 1: Descrição e Fornecedor */}
            <p>
                <strong>{transaction.description}</strong> 
                {transaction.supplier && <small> ({transaction.supplier})</small>}
            </p>

            {/* Linha 2: Valor e Data/Parcela */}
            <p>
                <span>{formattedAmount}</span>
                {' | '}
                <span>{transactionDate}</span>
                {transaction.installments_total > 1 && (
                    <small> (Parc. {transaction.installments_current}/{transaction.installments_total})</small>
                )}
            </p>
            
            {/* Linha 3: Categorias/Tipos (AGORA COM NOMES) */}
            <p style={{ fontSize: '0.8em', color: '#666' }}>
                **{categoryName}** | Tipo: {typeName}
            </p>

            {/* Linha 4: Metadados e Botão de Excluir */}
            <div>
                <p style={{ fontSize: '0.7em', color: '#999' }}>
                    Adicionado por: {userName}
                </p>
                <button 
                    onClick={handleDelete} 
                >
                    Excluir
                </button>
            </div>
            
        </div>
    );
};

export default TransactionItem;