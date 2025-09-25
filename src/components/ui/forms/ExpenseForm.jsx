// src/components/ui/ExpenseForm.jsx (ATUALIZADO E MENOR)

import React from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    updateDoc, 
    doc, 
    query, 
    where, 
    getDocs, 
    deleteDoc 
} from 'firebase/firestore'; 
import { useHousehold } from '../../../context/useHousehold';
import ExpenseDataUse from '../../../hooks/ExpenseDataUse'; // NOVO: Importa o hook

// A função de geração de ID único (Simulação)
const generateUniqueId = () => Math.random().toString(36).substring(2, 15);

// O formulário aceita o ID da despesa para habilitar o modo de edição
const ExpenseForm = ({ expenseId, onSaveSuccess }) => { 
    const { householdId, user } = useHousehold();
    
    // NOVO: Usa o hook para gerenciar todo o estado e fetch
    const {
        description, setDescription, supplier, setSupplier, amount, setAmount,
        category, setCategory, type, setType, date, setDate, installments, setInstallments,
        loading, categories, types, transactionId
    } = ExpenseDataUse(expenseId);


    // 1. Lógica de Gravação (Adição ou Edição)
    const handleSaveExpense = async (e) => {
        e.preventDefault();
        
        const expenseAmount = parseFloat(amount);
        const numInstallments = parseInt(installments);
        
        if (!householdId || !description.trim() || isNaN(expenseAmount) || expenseAmount <= 0) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // NOVO: Lógica de Edição de Grupo
        if (expenseId) {
            
            // Pergunta ao usuário se ele quer editar todas as parcelas
            const isGroupEdit = numInstallments > 1 && window.confirm(
                "Esta é uma despesa parcelada. Você deseja aplicar esta alteração a TODAS as parcelas do grupo? (Recomendado)"
            );
            
            if (isGroupEdit) {
                // 1. Deletar todas as despesas do grupo
                await deleteExpenseGroup(transactionId);
                
                // 2. Recriar todas as despesas com os novos dados
                await createExpenseGroup(expenseAmount, numInstallments, transactionId);

            } else {
                // Edição de parcela única: Apenas atualiza o documento atual
                const monthlyAmount = expenseAmount / numInstallments;
                await updateDoc(doc(db, `households/${householdId}/expenses`, expenseId), {
                    description: description.trim(),
                    supplier: supplier.trim(),
                    amount: monthlyAmount, 
                    category_id: category,
                    type_id: type,
                });
            }
            
            alert(`Despesa ${isGroupEdit ? 'e grupo' : 'única'} atualizado(s) com sucesso!`);

        } else {
            // Lógica de Adição (cria um novo transactionId)
            const newTransactionId = generateUniqueId();
            await createExpenseGroup(expenseAmount, numInstallments, newTransactionId);
            
            // Limpeza e Sucesso
            setDescription('');
            setSupplier('');
            setAmount('');
            alert(`Despesa de R$${expenseAmount.toFixed(2)} lançada e dividida em ${numInstallments} parcelas.`);
        }
        
        if (onSaveSuccess) onSaveSuccess();
    };


    // 2. Funções de CRUD (Movidas para fora do handleSave)
    
    // Função Auxiliar: Deleta todos os documentos de um grupo
    const deleteExpenseGroup = async (tId) => {
        const q = query(collection(db, `households/${householdId}/expenses`), where('transactionId', '==', tId));
        const snapshot = await getDocs(q);
        const batch = db.batch(); // Usar batch para exclusão em massa (mais eficiente)
        snapshot.docs.forEach((doc) => {
            deleteDoc(doc.ref);
        });
        // Não precisamos de batch se usarmos deleteDoc em loop, mas batch é mais escalável.
        // Por enquanto, vamos usar o getDocs e um loop simples para o exemplo ser mais claro:
        snapshot.docs.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
    };
    
    // Função Auxiliar: Cria o grupo de despesas (Adição ou Recriação)
    const createExpenseGroup = async (totalAmount, numInstallments, tId) => {
        const monthlyAmount = totalAmount / numInstallments;
        const startDate = new Date(date + 'T00:00:00'); 
        const yearMonthIndex = startDate.getFullYear().toString() + String(startDate.getMonth() + 1).padStart(2, '0');

        for (let i = 0; i < numInstallments; i++) {
            const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());

            await addDoc(collection(db, `households/${householdId}/expenses`), {
                description: description.trim(),
                supplier: supplier.trim(),
                amount: monthlyAmount, 
                category_id: category,
                type_id: type,
                date: installmentDate, 
                installments_total: numInstallments,
                installments_current: i + 1, 
                user_id: user.uid,
                yearMonth: yearMonthIndex,
                transactionId: tId, // NOVO: ID de grupo para rastrear
                createdAt: serverTimestamp()
            });
        }
    };


    if (loading) return <div>Carregando formulário...</div>;
    
    if (categories.length === 0 || types.length === 0) {
        return (
            <div>
                <h3>Adicionar Nova Despesa</h3>
                <p>Você precisa **adicionar categorias e tipos** de despesa antes de lançar.</p>
            </div>
        );
    }

    // 3. Renderização (O JSX é o mesmo, mas o código é 1/3 do original!)
    return (
        <form onSubmit={handleSaveExpense}> 
            {/* ... (Todo o JSX de input e select permanece o mesmo) ... */}
            
            <button type="submit">
                {expenseId ? 'Salvar Edição' : 'Adicionar Despesa'}
            </button>
        </form>
    );
};

export default ExpenseForm;