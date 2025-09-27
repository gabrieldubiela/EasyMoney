// src/hooks/useCombinedHouseholdData.js

import { useMemo } from 'react';
import useCategories from './useCategories';
import useTypes from './useTypes';
// Se você precisar do useAnnualData em muitos lugares, importe aqui também.

/**
 * Hook utilitário para combinar, formatar e centralizar dados de metadados da Household.
 * O objetivo é fornecer todas as listas de dados essenciais (categorias, tipos)
 * em um formato fácil de usar (como mapas {id: data}) para a UI.
 */
const useCombinedHouseholdData = () => {
    const { categories, loading: categoriesLoading } = useCategories();
    const { types, loading: typesLoading } = useTypes();
    
    // Usa useMemo para recalcular os mapas apenas quando as listas mudam
    const { categoryMap, typeMap } = useMemo(() => {
        // Converte as listas de arrays para mapas para buscas rápidas (O(1))
        const catMap = categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {});
        const typMap = types.reduce((acc, type) => ({ ...acc, [type.id]: type }), {});

        return {
            categoryMap: catMap,
            typeMap: typMap,
        };
    }, [categories, types]);

    const loading = categoriesLoading || typesLoading;

    return {
        // Dados brutos
        categories,
        types,
        
        // Dados formatados
        categoryMap, // { 'id1': {name: 'Aluguel', ...} }
        typeMap,     // { 'id2': {name: 'Fixo', ...} }
        
        loading,
    };
};

export default useCombinedHouseholdData;