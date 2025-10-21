// src/pages/CategoriesAndTypesPage.jsx

import React from 'react';
import { useAppContext } from '../context/AppContext';
import useTypes from '../hooks/useTypes';
import useCategories from '../hooks/useCategories';
import AddCategoryForm from '../components/forms/AddCategoryForm'; 
import AddTypeForm from '../components/forms/AddTypeForm';
import EditCategoryAndTypeItem from '../components/ui/EditCategoryAndTypeItem';


const CategoriesAndTypesPage = () => { 
    const { householdId, isLoading: householdLoading } = useAppContext(); 
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
                <h2>1. Tipos de Transação Atuais ({types.length})</h2>
                
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
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default CategoriesAndTypesPage;