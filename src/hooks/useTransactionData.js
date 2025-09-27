// src/hooks/useTransactionData.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore'; 
import { useHousehold } from '../context/useHousehold';

// CORREÇÃO: A função agora se chama 'useTransactionData' e é exportada diretamente.
export default function useTransactionData(transactionId) {
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
    const [transactionGroupId, setTransactionGroupId] = useState(null);

    // Efeito para buscar Categorias e Tipos
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
    }, [householdId, category, type]);

    // Efeito para carregar a despesa (APENAS SE ESTIVERMOS EDITANDO)
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
                
                setDescription(data.description || '');
                setSupplier(data.supplier || '');
                const originalAmount = Math.abs(data.amount * data.installments_total);
                setAmount(originalAmount.toFixed(2)); 
                setCategory(data.category_id);
                setType(data.type_id);
                const transactionDate = data.date.toDate().toISOString().substring(0, 10);
                setDate(transactionDate); 
                setInstallments(data.installments_total);
                setTransactionGroupId(data.transactionGroupId);
            } else {
                alert("Despesa não encontrada para edição.");
            }
            setLoading(false);
        };

        fetchTransaction();
    }, [transactionId, householdId]);
    
    return {
        description, setDescription,
        supplier, setSupplier,
        amount, setAmount,
        category, setCategory,
        type, setType,
        date, setDate,
        installments, setInstallments,
        loading,
        categories,
        types,
        transactionGroupId,
    };
};