// src/pages/TransactionListPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import TransactionList from '../components/tables/TransactionList';
import TransactionAdder from '../components/ui/TransactionAdder';
import TransactionFilter from '../components/ui/TransactionFilter';
import { useAppContext } from '../context/useAppContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const TransactionListPage = () => {
  const { householdId } = useAppContext();
  
  // Filtros individuais para evitar recriação de objeto
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  // Busca Categorias e Tipos
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

  // Cria o objeto filters apenas quando os valores mudam
  const filters = useMemo(() => ({
    category: categoryFilter,
    type: typeFilter,
    searchTerm: searchTerm,
    minDate: minDate,
    maxDate: maxDate
  }), [categoryFilter, typeFilter, searchTerm, minDate, maxDate]);

  const handleFilterChange = (newFilters) => {
    setCategoryFilter(newFilters.category || '');
    setTypeFilter(newFilters.type || '');
    setSearchTerm(newFilters.searchTerm || '');
    setMinDate(newFilters.minDate || '');
    setMaxDate(newFilters.maxDate || '');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Revisão Detalhada de Despesas</h1>
      </div>

      <TransactionAdder />

      <TransactionFilter
        categories={categories}
        types={types}
        onFilterChange={handleFilterChange}
      />

      <TransactionList
        filters={filters}
        categories={categories}
        types={types}
      />
    </div>
  );
};

export default TransactionListPage;