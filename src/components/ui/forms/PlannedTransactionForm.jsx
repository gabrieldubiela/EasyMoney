import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'; 
import { useHousehold } from '../../../hooks/useHousehold';

const PlannedTransactionForm = ({ onSaveSuccess }) => { 
    const { householdId, user } = useHousehold();
    const today = new Date().toISOString().substring(0, 10);

    // Estados do Formulário: Inicializados como VAZIOS ('') para forçar a escolha
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(''); // Começa vazio
    const [type, setType] = useState('');     // Começa vazio
    
    // Únicos campos predefinidos: data atual (hoje)
    const [paymentDate, setPaymentDate] = useState(today); 
    const [loading, setLoading] = useState(true);
    
    // Estados de Metadados
    const [categories, setCategories] = useState([]);
    const [typesList, setTypesList] = useState([]);

    const isIncomeType = (selectedTypeId) => {
        // Assume que o nome 'RECEITA' é o critério para sinal positivo.
        const transactionType = typesList.find(t => t.id === selectedTypeId); 
        return transactionType && transactionType.name.toUpperCase() === 'RECEITA';
    };

    // Busca Categorias e Tipos
    useEffect(() => {
        if (!householdId) { 
            setLoading(false); 
            return; 
        }
        
        // 1. Fetch Categorias
        const catRef = collection(db, `households/${householdId}/categories`);
        const unsubCat = onSnapshot(catRef, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        });

        // 2. Fetch Tipos
        const typeRef = collection(db, `households/${householdId}/types`);
        const unsubType = onSnapshot(typeRef, (snapshot) => {
            setTypesList(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
            setLoading(false);
        });

        return () => { 
            unsubCat(); 
            unsubType(); 
        };
    }, [householdId]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const originalAmount = parseFloat(amount);
        
        // 1. Validação
        if (!householdId || !description.trim() || isNaN(originalAmount) || originalAmount <= 0 || !category || !type) {
            alert("Por favor, preencha a Descrição, o Valor e selecione a Categoria e o Tipo.");
            return;
        }

        // 2. Aplicação do Sinal
        let transactionAmount = originalAmount;
        
        if (!isIncomeType(type)) {
            // Se NÃO for Receita (Despesa Fixa ou Variável), aplica o sinal negativo.
            transactionAmount = originalAmount * -1;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, `households/${householdId}/plannedTransactions`), { 
                description: description.trim(),
                amount: transactionAmount, 
                category_id: category,
                type_id: type,
                paymentDate: new Date(paymentDate + 'T00:00:00'),
                isPaid: false, 
                user_id: user.uid,
                createdAt: serverTimestamp()
            });

            // Feedback visual e limpeza
            const displayAmount = transactionAmount.toFixed(2);
            alert(`Transação planejada salva com sucesso! Valor salvo: R$${displayAmount}`);
            
            setDescription('');
            setAmount('');
            
            if (onSaveSuccess) onSaveSuccess();

        } catch (error) {
            console.error('Erro ao adicionar transação planejada:', error);
            alert('Falha ao adicionar transação planejada.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Carregando metadados...</div>;
    
    if (categories.length === 0 || typesList.length === 0) {
        return <div>Configure **Categorias** e **Tipos de Transação** para usar este formulário.</div>;
    }

    // JSX do formulário (sem CSS inline)
    return (
        <form onSubmit={handleSubmit}> 
            <h3>Adicionar Transação Planejada</h3>
            
            <input type="text" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <input type="number" placeholder="Valor (sem sinal)" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
            
            <label>Data de Pagamento Planejada:</label>
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
            
            {/* SELECT DE CATEGORIA */}
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="" disabled>Selecione a Categoria *</option>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            
            {/* SELECT DE TIPO */}
            <select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="" disabled>Selecione o Tipo *</option>
                {typesList.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>

            <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Transação Planejada'}
            </button>
        </form>
    );
};

export default PlannedTransactionForm;