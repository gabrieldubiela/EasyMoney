// src/components/pages/TransactionListPage.jsx

import React, { useState, useEffect } from 'react';
import TransactionList from '../ui/lists/TransactionList';
import TransactionAdder from '../ui/TransactionAdder';
import TransactionFilters from '../ui/TransactionFilters';
import { useHousehold } from '../../context/useHousehold';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const TransactionListPage = () => {
    const { householdId } = useHousehold();
    // Estado que será passado do Filtro para a Lista
    const [filters, setFilters] = useState({}); 
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);

    // Busca Categorias e Tipos para popular o TransactionFilters (dropdowns)
    useEffect(() => {
        if (!householdId) return;

        const catRef = collection(db, `households/${householdId}/categories`);
        const unsubCat = onSnapshot(catRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setCategories(list);
        });

        const typeRef = collection(db, `households/${householdId}/types`);
        const unsubType = onSnapshot(typeRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setTypes(list);
        });

        return () => { unsubCat(); unsubType(); };
    }, [householdId]);

    // Callback para receber as mudanças de filtro
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div>
            <h1>Revisão Detalhada de Despesas</h1>
            
            {/* O Adicionar Despesa (Toggle) */}
            <TransactionAdder />

            {/* NOVO: Componente de Filtros */}
            <TransactionFilters 
                categories={categories}
                types={types}
                onFilterChange={handleFilterChange} // Envia a função de callback
            />

            {/* A Lista agora recebe os filtros e implementa a lógica */}
            <TransactionList filters={filters} /> 
            
        </div>
    );
};

export default TransactionListPage;