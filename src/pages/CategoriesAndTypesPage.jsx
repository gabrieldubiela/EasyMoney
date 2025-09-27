// src/pages/CategoriesAndTypesPage.jsx

import React from 'react';
// IMPORTAÇÃO CORRETA DOS HOOKS E COMPONENTES
import { useHousehold } from '../../context/useHousehold';
import useTypes from '../../hooks/useTypes'; // Importa o hook para Tipos
import useCategories from '../../hooks/useCategories'; // Assumindo que você criou este hook

import AddCategoryForm from '../ui/AddCategoryForm'; 
import AddTypeForm from '../ui/AddTypeForm'; 
import EditCategoryAndTypeItem from '../ui/EditCategoryAndTypeItem';

// NOTA: Os imports de db e onSnapshot não são mais necessários nesta página.

const CategoriesAndTypesPage = () => { 
    // Substituindo os useEffects pela chamada dos Hooks
    const { householdId, isLoading: householdLoading } = useHousehold(); 
    const { types, loading: typesLoading } = useTypes();
    const { categories, loading: categoriesLoading } = useCategories();

    // Consolida o estado de loading
    const isLoading = householdLoading || typesLoading || categoriesLoading;

    if (isLoading) {
        return <div>Carregando Gerenciamento...</div>;
    }
    
    if (!householdId) {
        return <div>Você precisa estar em uma família para gerenciar categorias e tipos.</div>;
    }
    
    // Funções auxiliares para buscar o nome do Tipo (para exibição)
    const getTypeName = (typeId) => {
        return types.find(t => t.id === typeId)?.name || 'TIPO NÃO DEFINIDO';
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Gerenciar Categorias & Tipos</h1>

            {/* PRIMEIRA SEÇÃO: GESTÃO DE TIPOS */}
            <section style={{ marginBottom: '40px' }}>
                <h2>1. Tipos de Gasto/Receita Atuais ({types.length})</h2>
                
                {/* O AddTypeForm deve receber a função de adicionar e a lista para validação */}
                <AddTypeForm existingTypes={types} /> 
                
                <div style={{ marginTop: '10px' }}>
                    {types.map(typeItem => (
                        <EditCategoryAndTypeItem 
                            key={typeItem.id} 
                            item={typeItem} // Passamos o item (Tipo)
                            isType={true}
                        /> 
                    ))}
                </div>
            </section>

            <hr style={{ margin: '30px 0' }}/>

            {/* SEGUNDA SEÇÃO: GESTÃO DE CATEGORIAS */}
            <section>
                <h2>2. Categorias Atuais ({categories.length})</h2>
                
                {/* O AddCategoryForm precisa da lista de TIPOS disponíveis para o SELECT */}
                <AddCategoryForm types={types} existingCategories={categories} /> 
                
                <div style={{ marginTop: '10px' }}>
                    {categories.map(category => (
                        <EditCategoryAndTypeItem 
                            key={category.id} 
                            item={category} 
                            isType={false}
                            typeName={getTypeName(category.typeId)} // Passamos o nome do Tipo
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default CategoriesAndTypesPage;