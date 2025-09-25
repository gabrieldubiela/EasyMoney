import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
// ATUALIZADO: Usando addDoc para IDs automáticos
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useHousehold } from '../context/useHousehold';
import CategoryItem from './CategoryItem'; // Importado para uso

const CategoriesPage = () => {
  const { householdId, isLoading } = useHousehold(); 
  
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Efeito para buscar as categorias em tempo real (Sem alteração)
  useEffect(() => {
    if (!householdId) {
        setLoading(false);
        return; 
    }

    const categoriesCollectionRef = collection(db, `households/${householdId}/categories`);
    
    const unsubscribe = onSnapshot(categoriesCollectionRef, (snapshot) => {
      const categoriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      categoriesList.sort((a, b) => a.name.localeCompare(b.name)); 
      setCategories(categoriesList);
      setLoading(false);
    }, (error) => {
        console.error("Erro ao buscar categorias:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [householdId]);


  // 2. Função para adicionar uma nova categoria (AGORA COM ID ALEATÓRIO)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const categoryName = newCategoryName.trim();
    if (!categoryName || !householdId) return;
    
    // Opcional: Impedir duplicidade de nome antes de adicionar
    const exists = categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    if (exists) {
        alert(`A categoria "${categoryName}" já existe.`);
        return;
    }

    try {
      const categoriesCollectionRef = collection(db, `households/${householdId}/categories`);
      
      // NOVO: Usa addDoc para criar o documento e gerar um ID aleatório
      await addDoc(categoriesCollectionRef, {
        name: categoryName,
        createdAt: serverTimestamp()
      });

      setNewCategoryName('');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  if (isLoading || loading) {
    return <div>Carregando Categorias...</div>;
  }
  
  if (!householdId) {
      return <div>Você precisa estar em uma família para gerenciar categorias.</div>;
  }

  return (
    <div>
      <h1>Gerenciar Categorias</h1>

      {/* Formulário de Adição */}
      <form onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="Nome da Nova Categoria (Ex: Alimentação)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          required
        />
        <button type="submit">Adicionar Categoria</button>
      </form>

      <hr />

      <h2>Categorias Atuais ({categories.length})</h2>
      <div>
        {categories.map(category => (
          <CategoryItem 
            key={category.id} 
            category={category} 
            // NOTE: A lógica de exclusão/edição será atualizada a seguir
          />
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;