// src/hooks/TransactionDataUse.js

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore'; 
import { useHousehold } from '../context/useHousehold';

// O hook recebe o ID da despesa
const TransactionDataUse = (transactionId) => {
    const { householdId } = useHousehold();
    
    // Estados do Formulário
    const [description, setDescription] = useState('');
    const [supplier, setSupplier] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10)); 
    const [installments, setInstallments] = useState(1); 
    
    // Estados de Dados e Status
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [transactionId, setTransactionId] = useState(null); // NOVO: ID do grupo de parcelas

    // 1. Efeito para buscar Categorias e Tipos
    useEffect(() => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        const catRef = collection(db, `households/${householdId}/categories`);
        const unsubCat = onSnapshot(catRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setCategories(list);
            if (list.length > 0 && !category) setCategory(list[0].id);
        });

        const typeRef = collection(db, `households/${householdId}/types`);
        const unsubType = onSnapshot(typeRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setTypes(list);
            if (list.length > 0 && !type) setType(list[0].id);
        });

        return () => { unsubCat(); unsubType(); };
    }, [householdId]);

    // 2. Efeito para carregar a despesa (APENAS SE ESTIVERMOS EDITANDO)
    useEffect(() => {
        if (!transactionId || !householdId) {
            setLoading(false);
            return;
        }

        const fetchTransaction = async () => {
            const transactionDocRef = doc(db, `households/${householdId}/transactions`, transactionId);
            const docSnap = await getDoc(transactionDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Pré-preenche estados
                setDescription(data.description || '');
                setSupplier(data.supplier || '');
                const originalAmount = data.amount * data.installments_total;
                setAmount(originalAmount.toFixed(2)); 
                setCategory(data.category_id);
                setType(data.type_id);
                const transactionDate = data.date.toDate().toISOString().substring(0, 10);
                setDate(transactionDate); 
                setInstallments(data.installments_total);
                setTransactionId(data.transactionId || data.id); // NOVO: Usa o ID do grupo ou o próprio ID (se não for parcelado)
            } else {
                alert("Despesa não encontrada para edição.");
            }
            setLoading(false);
        };

        fetchTransaction();
    }, [transactionId, householdId]);
    
    // Retorna todos os estados e setters necessários
    return {
        // Dados do formulário e setters
        description, setDescription,
        supplier, setSupplier,
        amount, setAmount,
        category, setCategory,
        type, setType,
        date, setDate,
        installments, setInstallments,
        
        // Metadados e status
        loading,
        categories,
        types,
        transactionId, // NOVO: ID do grupo de parcelas
    };
};

export default TransactionDataUse;