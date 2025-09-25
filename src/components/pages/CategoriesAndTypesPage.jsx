// src/components/pages/CategoriesAndTypesPage.jsx (APENAS O CORPO DA FUNÇÃO/RETURN)

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { useHousehold } from '../../context/useHousehold';
import EditCategoryAndTypeItem  from '../ui/EditCategoryAndTypeItem';
// NOVO: Importe os dois formulários
import AddCategoryForm from '../ui/AddCategoryForm'; 
import AddTypeForm from '../ui/AddTypeForm'; 


const CategoriesAndTypesPage = () => { 
    const { householdId, isLoading } = useHousehold(); 
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]); 
    const [loading, setLoading] = useState(true);

    // Efeito para buscar CATEGORIAS
    useEffect(() => {
        if (!householdId) { setLoading(false); return; }
        const categoriesCollectionRef = collection(db, `households/${householdId}/categories`);
        const unsubscribe = onSnapshot(categoriesCollectionRef, (snapshot) => {
            const categoriesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            categoriesList.sort((a, b) => a.name.localeCompare(b.name)); 
            setCategories(categoriesList);
            setLoading(false);
        }, (error) => { console.error("Erro ao buscar categorias:", error); setLoading(false); });
        return () => unsubscribe();
    }, [householdId]);

    // Efeito para buscar TIPOS
    useEffect(() => {
        if (!householdId) { return; }
        const typesCollectionRef = collection(db, `households/${householdId}/types`);
        const unsubscribe = onSnapshot(typesCollectionRef, (snapshot) => {
            const typesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            typesList.sort((a, b) => a.name.localeCompare(b.name));
            setTypes(typesList);
        }, (error) => { console.error("Erro ao buscar tipos:", error); });
        return () => unsubscribe();
    }, [householdId]);


    if (isLoading || loading) {
        return <div>Carregando Gerenciamento...</div>;
    }
    
    if (!householdId) {
        return <div>Você precisa estar em uma família para gerenciar categorias e tipos.</div>;
    }

    return (
        <div>
            <h1>Gerenciar Categorias & Tipos</h1>

            {/* SEÇÃO DE CATEGORIAS */}
            <h2>Categorias Atuais ({categories.length})</h2>
            <AddCategoryForm categories={categories} /> {/* NOVO: Passando a lista */}
            <div>
                {categories.map(category => (
                    <EditCategoryAndTypeItem  key={category.id} category={category} />
                ))}
            </div>

            <hr />

            {/* SEÇÃO DE TIPOS */}
            <h2>Tipos de Despesa Atuais ({types.length})</h2>
            <AddTypeForm types={types} /> {/* NOVO: Passando a lista */}
            <div>
                 {/* Reutilizando EditCategoryAndTypeItem , mas note que ele precisa lidar com Types também */}
                {types.map(typeItem => (
                    <EditCategoryAndTypeItem  key={typeItem.id} category={typeItem} isType={true} /> 
                ))}
            </div>
        </div>
    );
};

export default CategoriesAndTypesPage;