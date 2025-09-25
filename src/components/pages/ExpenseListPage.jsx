// src/components/pages/ExpenseListPage.jsx

import React, { useState, useEffect } from 'react';
import ExpenseList from '../ui/lists/ExpenseList';
import ExpenseAdder from '../ui/ExpenseAdder';
import ExpenseFilters from '../ui/ExpenseFilters';
import { useHousehold } from '../../context/useHousehold';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const ExpenseListPage = () => {
    const { householdId } = useHousehold();
    // Estado que será passado do Filtro para a Lista
    const [filters, setFilters] = useState({}); 
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);

    // Busca Categorias e Tipos para popular o ExpenseFilters (dropdowns)
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
            <ExpenseAdder />

            {/* NOVO: Componente de Filtros */}
            <ExpenseFilters 
                categories={categories}
                types={types}
                onFilterChange={handleFilterChange} // Envia a função de callback
            />

            {/* A Lista agora recebe os filtros e implementa a lógica */}
            <ExpenseList filters={filters} /> 
            
        </div>
    );
};

export default ExpenseListPage;