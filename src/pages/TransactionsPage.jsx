// src/pages/TransactionPage.jsx

import React, { useState, useMemo } from 'react';
import TransactionList from '../components/tables/TransactionList';
import TransactionAdder from '../components/ui/TransactionAdder';
import TransactionFilter from '../components/ui/TransactionFilter';
import { useAppContext } from '../context/useAppContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const TransactionPage = () => {
  const { householdId } = useAppContext();

  // Filtros (com presets novos)
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  // Busca metadados de categoria/tipo
  React.useEffect(() => {
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

  // Novo formato padrão para filtros (compatível com hook/service)
  const filters = useMemo(() => ({
    categoryId: categoryFilter,
    typeId: typeFilter,
    searchTerm,
    startDate: minDate,
    endDate: maxDate,
    limit: 15 // scroll infinito, aumenta conforme carregamento
  }), [categoryFilter, typeFilter, searchTerm, minDate, maxDate]);

  // Callback dos filtros
  const handleFilterChange = (newFilters) => {
    setCategoryFilter(newFilters.categoryId || '');
    setTypeFilter(newFilters.typeId || '');
    setSearchTerm(newFilters.searchTerm || '');
    setMinDate(newFilters.startDate || '');
    setMaxDate(newFilters.endDate || '');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Revisão Detalhada de Despesas</h1>
      </div>

      <TransactionAdder/>

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

export default TransactionPage;
