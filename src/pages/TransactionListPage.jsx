// src/pages/TransactionListPage.jsx

import React, { useState, useEffect } from 'react';
import TransactionList from '../components/ui/lists/TransactionList';
import TransactionAdder from '../components/ui/TransactionAdder';
import TransactionFilter from '../components/ui/lists/TransactionFilter';
import { useHousehold } from '../hooks/useHousehold';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const TransactionListPage = () => {
  const { householdId } = useHousehold();
  const [filters, setFilters] = useState({});
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  // Busca Categorias e Tipos para popular os filtros e a lista
  useEffect(() => {
    if (!householdId) return;

    const catRef = collection(db, `households/${householdId}/categories`);
    const unsubCat = onSnapshot(catRef, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const typeRef = collection(db, `households/${householdId}/types`);
    const unsubType = onSnapshot(typeRef, (snapshot) => {
      setTypes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubCat();
      unsubType();
    };
  }, [householdId]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <h1>Revisão Detalhada de Despesas</h1>
      
      <TransactionAdder />

      <TransactionFilter
        categories={categories}
        types={types}
        onFilterChange={handleFilterChange}
      />

      {/* A Lista agora recebe os filtros e os metadados para evitar buscas duplicadas */}
      <TransactionList
        filters={filters}
        categories={categories}
        types={types}
      />
    </div>
  );
};

export default TransactionListPage;