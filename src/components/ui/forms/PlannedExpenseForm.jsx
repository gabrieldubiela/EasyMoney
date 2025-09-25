// src/components/ui/PlannedExpenseForm.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'; 
import { useHousehold } from '../../../context/useHousehold';

const PlannedExpenseForm = ({ onSaveSuccess }) => { 
    const { householdId, user } = useHousehold();
    
    // Estados do Formulário (Simples, sem parcelas)
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().substring(0, 10)); // Data de Pagamento Planejada
    const [loading, setLoading] = useState(true);
    
    // Estados de Metadados (Categorias e Tipos)
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);

    // Busca Categorias e Tipos (similar ao ExpenseForm)
    useEffect(() => {
        if (!householdId) { setLoading(false); return; }
        // ... (lógica de onSnapshot para categorias e tipos) ...
        const catRef = collection(db, `households/${householdId}/categories`);
        const unsubCat = onSnapshot(catRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setCategories(list);
            if (list.length > 0 && !category) setCategory(list[0].id);
        });
        // ... (lógica de onSnapshot para tipos) ...
        const typeRef = collection(db, `households/${householdId}/types`);
        const unsubType = onSnapshot(typeRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setTypes(list);
            if (list.length > 0 && !type) setType(list[0].id);
            setLoading(false);
        });

        return () => { unsubCat(); unsubType(); };
    }, [householdId, category, type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const expenseAmount = parseFloat(amount);
        
        if (!householdId || !description.trim() || isNaN(expenseAmount) || expenseAmount <= 0) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, `households/${householdId}/plannedExpenses`), { // NOVA COLEÇÃO
                description: description.trim(),
                amount: expenseAmount, 
                category_id: category,
                type_id: type,
                paymentDate: new Date(paymentDate + 'T00:00:00'), // Data planeada
                isPaid: false, // Status inicial
                user_id: user.uid,
                createdAt: serverTimestamp()
            });

            alert(`Despesa planejada de R$${expenseAmount.toFixed(2)} salva com sucesso!`);
            setDescription('');
            setAmount('');
            if (onSaveSuccess) onSaveSuccess();

        } catch (error) {
            console.error('Erro ao adicionar despesa planejada:', error);
            alert('Falha ao adicionar despesa planejada.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Carregando...</div>;
    // ... (restante da validação de categorias/tipos) ...

    return (
        <form onSubmit={handleSubmit}> 
            <h3>Adicionar Despesa Planejada</h3>
            {/* Campos de formulário (Valor, Descrição, Categoria, Tipo, Data) */}
            <input type="number" placeholder="Valor" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <input type="text" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
            
            <label>Data de Pagamento Planejada:</label>
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
            
            {/* Selects de Categoria e Tipo (idênticos aos do ExpenseForm) */}
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} required>
                {types.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>

            <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Despesa Planejada'}
            </button>
        </form>
    );
};

export default PlannedExpenseForm;