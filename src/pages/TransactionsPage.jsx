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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [yearMonth, setYearMonth] = useState('');
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
    supplier,
    description,
    startDate: minDate,
    endDate: maxDate,
    yearMonth,
    limit: 15 // scroll infinito, aumenta conforme carregamento
  }), [categoryFilter, typeFilter, supplier, minDate, maxDate, yearMonth, description]);

  // Callback dos filtros
  const handleFilterChange = (newFilters) => {
    setCategoryFilter(newFilters.categoryId || '');
    setTypeFilter(newFilters.typeId || '');
    setSupplier(newFilters.supplier || '');
    setDescription(newFilters.description || '');
    setMinDate(newFilters.startDate || '');
    setMaxDate(newFilters.endDate || '');
    setYearMonth(newFilters.yearMonth || '');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Transações</h1>
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

export default TransactionPage;
