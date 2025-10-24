// src/components/ui/TransactionFilters.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, limit, getDocs } from 'firebase/firestore'; 
import { useAppContext } from '../../context/useAppContext';
import "../../styles/forms.css";
import "../../styles/buttons.css";
import "../../styles/filters.css";

// Funções para presets de data
function getMonthPeriod() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    minDate: start.toISOString().substr(0, 10),
    maxDate: end.toISOString().substr(0, 10)
  };
}
function getThreeMonthsPeriod() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    minDate: start.toISOString().substr(0, 10),
    maxDate: end.toISOString().substr(0, 10)
  };
}
function getYearPeriod() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  const end = new Date(today.getFullYear(), 11, 31);
  return {
    minDate: start.toISOString().substr(0, 10),
    maxDate: end.toISOString().substr(0, 10)
  };
}

const periodPresets = [
  { label: 'Mês Atual', value: 'month' },
  { label: 'Últimos 3 Meses', value: 'threeMonths' },
  { label: 'Ano Atual', value: 'year' },
  { label: 'Personalizado', value: 'custom' }
];

const TransactionFilters = ({ categories, types, onFilterChange }) => {
  const { householdId } = useAppContext();
  // Nova: filtro de período
  const [period, setPeriod] = useState('month');

  // Filtros detalhados
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  // Sugestões
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState([]);

  // Atualiza datas ao trocar preset de período
  useEffect(() => {
    if (period === 'month') {
      const { minDate, maxDate } = getMonthPeriod();
      setMinDate(minDate);
      setMaxDate(maxDate);
    } else if (period === 'threeMonths') {
      const { minDate, maxDate } = getThreeMonthsPeriod();
      setMinDate(minDate);
      setMaxDate(maxDate);
    } else if (period === 'year') {
      const { minDate, maxDate } = getYearPeriod();
      setMinDate(minDate);
      setMaxDate(maxDate);
    }
    // Personalizado: não altera minDate/maxDate
  }, [period]);

  // Sugestão de fornecedor/descrição (para buscar rápida)
  const fetchSuggestions = useCallback(async (field, term) => {
    if (!householdId || term.length < 2) return [];
    const q = query(
      collection(db, `households/${householdId}/transactions`),
      limit(5)
    );
    try {
      const snapshot = await getDocs(q);
      const values = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data[field] && data[field].toLowerCase().includes(term.toLowerCase())) {
          values.add(data[field]);
        }
      });
      return Array.from(values);
    } catch (error) {
      console.error(`Erro ao buscar sugestões de ${field}:`, error);
      return [];
    }
  }, [householdId]);

  useEffect(() => {
    const updateSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSupplierSuggestions([]);
        setDescriptionSuggestions([]);
        return;
      }
      const suppliers = await fetchSuggestions('supplier', searchTerm);
      setSupplierSuggestions(suppliers);
      const descriptions = await fetchSuggestions('description', searchTerm);
      setDescriptionSuggestions(descriptions);
    };
    updateSuggestions();
  }, [searchTerm, fetchSuggestions]);

  // Notifica componente pai sobre filtros
  useEffect(() => {
    const filters = {
      categoryId: selectedCategory,
      typeId: selectedType,
      searchTerm: searchTerm.trim(),
      startDate: minDate,
      endDate: maxDate
    };
    onFilterChange(filters);
    // eslint-disable-next-line
  }, [selectedCategory, selectedType, searchTerm, minDate, maxDate]);

  // Limpa todos filtros
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedType('');
    setSearchTerm('');
    setPeriod('month');
  };

  return (
    <div className="transaction-filter">
      <h3 className="transaction-filter-title">Filtros de Transações</h3>

      {/* Período com presets */}
      <div className="transaction-filter-row">
        <div className="transaction-filter-col">
          <label className="form-label">Período:</label>
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            {periodPresets.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {(period === "custom") && (
        <>
          <div className="transaction-filter-col">
            <label className="form-label">De:</label>
            <input type="date" value={minDate} onChange={e => setMinDate(e.target.value)} />
          </div>
          <div className="transaction-filter-col">
            <label className="form-label">Até:</label>
            <input type="date" value={maxDate} onChange={e => setMaxDate(e.target.value)} />
          </div>
        </>
        )}
      </div>

      {/* Categoria e tipo */}
      <div className="transaction-filter-row">
        <div className="transaction-filter-col">
          <label className="form-label">Categoria</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="transaction-filter-col">
          <label className="form-label">Tipo</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">Todos os Tipos</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Busca por fornecedor/descrição */}
      <div className="form-group">
        <label className="form-label">Buscar</label>
        <input
          type="text"
          placeholder="Buscar Fornecedor ou Descrição"
          list="search-suggestions"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <datalist id="search-suggestions">
          {supplierSuggestions.map((s, i) => <option key={`sup-${i}`} value={s} />)}
          {descriptionSuggestions.map((d, i) => <option key={`desc-${i}`} value={d} />)}
        </datalist>
      </div>
      <button onClick={clearFilters} className="btn btn-secondary btn-block" type="button">
        Limpar Filtros
      </button>
    </div>
  );
};

export default TransactionFilter;