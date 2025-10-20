// src/components/ui/TransactionFilters.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, limit, getDocs } from 'firebase/firestore'; 
import { useAppContext } from '../../context/AppContext';

// O componente recebe os IDs de categorias/tipos para popular os dropdowns
const TransactionFilters = ({ categories, types, onFilterChange }) => {
    const { householdId } = useAppContext();
    
    // Estados dos Filtros
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Para Fornecedor/Descrição
    const [minDate, setMinDate] = useState('');
    const [maxDate, setMaxDate] = useState('');
    
    // Estados para Sugestões
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [descriptionSuggestions, setDescriptionSuggestions] = useState([]);

    // 1. Função que busca sugestões de Fornecedor ou Descrição
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


    // 2. Efeito para buscar sugestões (debounce seria ideal)
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


    // 3. Efeito para notificar o componente pai (TransactionList) sobre a mudança
    useEffect(() => {
        const filters = {
            category: selectedCategory,
            type: selectedType,
            searchTerm: searchTerm.trim(),
            minDate,
            maxDate,
        };
        // Chama a prop para atualizar a lista no TransactionList
        onFilterChange(filters);
    }, [selectedCategory, selectedType, searchTerm, minDate, maxDate, onFilterChange]);


    return (
        <div className="transaction-filter">
            <h3 className="transaction-filter-title">Filtros de Transações</h3>

            <div className="transaction-filter-row">
                <div className="transaction-filter-col">
                    <label className="form-label">Período de:</label>
                    <input type="date" value={minDate} onChange={(e) => setMinDate(e.target.value)} />
                </div>
                <div className="transaction-filter-col">
                    <label className="form-label">até:</label>
                    <input type="date" value={maxDate} onChange={(e) => setMaxDate(e.target.value)} />
                </div>
            </div>

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

            <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedType(''); setMinDate(''); setMaxDate(''); }} className="btn-outline btn-block">
                Limpar Filtros
            </button>
        </div>
    );
};

export default TransactionFilters;