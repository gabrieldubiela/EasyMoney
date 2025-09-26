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
    writeBatch 
} from 'firebase/firestore'; 
import { useHousehold } from '../../../context/useHousehold';
import TransactionDataUse from '../../../hooks/TransactionDataUse'; 

// Função de geração de ID único (Simulação)
const generateUniqueId = () => Math.random().toString(36).substring(2, 15);

const TransactionForm = ({ transactionId, onSaveSuccess }) => { 
    const { householdId, user } = useHousehold();
    
    // Desestruturação limpa do hook
    const {
        description, setDescription, supplier, setSupplier, amount, setAmount,
        category, setCategory, type, setType, date, setDate, installments, setInstallments, 
        loading, categories, types, transactionGroupId
    } = TransactionDataUse(transactionId);


    // Lógica para determinar se o tipo selecionado é Receita
    const isIncomeType = (selectedTypeId) => {
        const transactionType = types.find(t => t.id === selectedTypeId); 
        return transactionType && transactionType.name.toUpperCase() === 'RECEITA';
    };


    // 1. Lógica de Gravação (Adição ou Edição)
    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        
        const originalAmount = parseFloat(amount);
        const numInstallments = parseInt(installments);
        
        if (!householdId || !description.trim() || isNaN(originalAmount) || originalAmount <= 0 || !category || !type) {
            alert("Por favor, preencha todos os campos obrigatórios (incluindo Categoria e Tipo) e use um valor positivo.");
            return;
        }

        // --- APLICAÇÃO DO SINAL ---
        let signedAmount = originalAmount;
        if (!isIncomeType(type)) {
            // Se NÃO for Receita (Despesa Fixa ou Variável), aplica o sinal negativo.
            signedAmount = originalAmount * -1;
        }
        // -------------------------

        // Início da Lógica de Salvar/Editar
        if (transactionId) {
            
            const isGroupEdit = numInstallments > 1 && window.confirm(
                "Esta é uma transação parcelada. Você deseja aplicar esta alteração a TODAS as parcelas do grupo? (Recomendado)"
            );
            
            if (isGroupEdit) {
                // Deletar o grupo e recriar com o NOVO VALOR ASSINADO
                await deleteTransactionGroup(transactionGroupId);
                await createTransactionGroup(signedAmount, numInstallments, transactionGroupId); 

            } else {
                // Edição de parcela única: Calcula o valor mensal do NOVO VALOR ASSINADO
                const monthlyAmount = signedAmount / numInstallments;
                await updateDoc(doc(db, `households/${householdId}/transactions`, transactionId), {
                    description: description.trim(),
                    supplier: supplier.trim(),
                    amount: monthlyAmount, 
                    category_id: category,
                    type_id: type,
                });
            }
            
            alert(`Transação atualizada com sucesso! Novo Valor: R$${signedAmount.toFixed(2)}`);

        } else {
            // Lógica de Adição
            const newTransactionGroupId = generateUniqueId();
            // Cria o grupo com o NOVO VALOR ASSINADO
            await createTransactionGroup(signedAmount, numInstallments, newTransactionGroupId);
            
            // Limpeza e Sucesso
            setDescription('');
            setSupplier('');
            setAmount('');
            alert(`Transação de R$${signedAmount.toFixed(2)} lançada e dividida em ${numInstallments} parcelas.`);
        }
        
        if (onSaveSuccess) onSaveSuccess();
    };


    // 2. Funções Auxiliares de CRUD
    
    // Função Auxiliar: Deleta todos os documentos de um grupo
    const deleteTransactionGroup = async (tId) => {
        const q = query(collection(db, `households/${householdId}/transactions`), where('transactionId', '==', tId));
        const snapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    };
    
    // Função Auxiliar: Cria o grupo de transações
    const createTransactionGroup = async (totalSignedAmount, numInstallments, tId) => {
        const monthlyAmount = totalSignedAmount / numInstallments; 
        const startDate = new Date(date + 'T00:00:00'); 
        const yearMonthIndex = startDate.getFullYear().toString() + String(startDate.getMonth() + 1).padStart(2, '0');

        for (let i = 0; i < numInstallments; i++) {
            const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());

            await addDoc(collection(db, `households/${householdId}/transactions`), {
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
                transactionId: tId, 
                createdAt: serverTimestamp()
            });
        }
    };


    if (loading) return <div>Carregando formulário...</div>;
    
    if (categories.length === 0 || types.length === 0) {
        return (
            <div>
                <h3>Adicionar Transação</h3>
                <p>Você precisa **adicionar categorias e tipos** de transação antes de lançar.</p>
            </div>
        );
    }

    // 3. Renderização do Formulário (Sem CSS Inline)
    return (
        <form onSubmit={handleSaveTransaction}> 
            <h3>{transactionId ? 'Editar Transação' : 'Adicionar Transação'}</h3>
            
            <input type="text" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <input type="text" placeholder="Fornecedor/Origem" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            <input type="number" placeholder="Valor Total (sem sinal)" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
            
            <label>Data da 1ª Parcela:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            
            <label>Número de Parcelas:</label>
            <input type="number" value={installments} onChange={(e) => setInstallments(e.target.value)} required min="1" />
            
            {/* SELECT DE CATEGORIA */}
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="" disabled>Selecione a Categoria *</option>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            
            {/* SELECT DE TIPO */}
            <select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="" disabled>Selecione o Tipo *</option>
                {types.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>

            <button type="submit" disabled={loading}>
                {loading ? 'Processando...' : (transactionId ? 'Salvar Edição' : 'Adicionar Transação')}
            </button>
        </form>
    );
};

export default TransactionForm;