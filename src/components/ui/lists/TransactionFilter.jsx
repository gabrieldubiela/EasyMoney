// src/components/ui/TransactionFilters.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, query, limit, getDocs } from 'firebase/firestore'; 
import { useHousehold } from '../../../context/useHousehold';

// O componente recebe os IDs de categorias/tipos para popular os dropdowns
const TransactionFilters = ({ categories, types, onFilterChange }) => {
    const { householdId } = useHousehold();
    
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
            // Busca despesas onde o campo começa com o termo de busca
            // NOTE: Firestore não tem 'LIKE'. Isso é uma simulação básica de prefixo.
            // Para produção, é recomendado usar ElasticSearch/Algolia.
            limit(5)
        );

        // NOTA: No Firestore real, você precisaria criar índices para campos específicos.
        // E a query de prefixo real é difícil. Aqui, só faremos a busca, e o filtro
        // final na lista será feito no React (menos eficiente, mas funcional).
        
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
        <div style={{ padding: '15px', border: '1px solid #ccc' }}>
            <h3>Filtros de Despesas</h3>
            
            {/* Filtro de Período */}
            <label>Período de:</label>
            <input type="date" value={minDate} onChange={(e) => setMinDate(e.target.value)} />
            <label> a </label>
            <input type="date" value={maxDate} onChange={(e) => setMaxDate(e.target.value)} />

            {/* Filtro de Categoria */}
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Todas as Categorias</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            {/* Filtro de Tipo */}
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">Todos os Tipos</option>
                {types.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
            
            {/* Campo de Busca (Fornecedor/Descrição) com Sugestões */}
            <input 
                type="text" 
                placeholder="Buscar Fornecedor ou Descrição"
                list="search-suggestions" // Liga ao datalist
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            
            {/* Datalist para Autocomplete */}
            <datalist id="search-suggestions">
                {supplierSuggestions.map((s, i) => <option key={`sup-${i}`} value={s} />)}
                {descriptionSuggestions.map((d, i) => <option key={`desc-${i}`} value={d} />)}
            </datalist>

            <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedType(''); setMinDate(''); setMaxDate(''); }}>
                Limpar Filtros
            </button>
        </div>
    );
};

export default TransactionFilters;