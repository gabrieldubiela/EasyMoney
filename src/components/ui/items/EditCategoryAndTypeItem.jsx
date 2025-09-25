import React, { useState } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'; // Importado updateDoc
import { useHousehold } from '../../../context/useHousehold';

const EditCategoryAndTypeItem  = ({ category }) => {
  const { householdId } = useHousehold();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(category.name);
  
  // 1. Lógica de Exclusão (Atualizada para usar o ID gerado)
  const handleDelete = async () => {
    if (!householdId || !category.id) return;

    if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      try {
        const categoryDocRef = doc(db, `households/${householdId}/categories`, category.id);
        await deleteDoc(categoryDocRef);
        console.log(`Categoria ${category.name} excluída com sucesso!`);
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria. Pode haver despesas associadas a ela.');
      }
    }
  };

  // 2. Lógica de Edição
  const handleSaveEdit = async () => {
    const trimmedName = editedName.trim();
    if (!trimmedName || trimmedName === category.name) {
        setIsEditing(false); // Sai do modo de edição se o nome não mudou
        setEditedName(category.name); // Garante que o nome volte ao original
        return;
    }
    
    try {
        const categoryDocRef = doc(db, `households/${householdId}/categories`, category.id);
        
        await updateDoc(categoryDocRef, {
            name: trimmedName
        });

        setIsEditing(false);
        console.log(`Categoria ${category.id} atualizada para: ${trimmedName}`);
    } catch (error) {
        console.error('Erro ao salvar edição:', error);
        alert('Erro ao salvar a edição.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
      
      {isEditing ? (
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleSaveEdit} // Salva quando perde o foco
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit();
            if (e.key === 'Escape') {
                setIsEditing(false);
                setEditedName(category.name);
            }
          }}
          autoFocus
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)}>{category.name}</span>
      )}

      {isEditing ? (
        <button onClick={handleSaveEdit}>Salvar</button>
      ) : (
        <button onClick={() => setIsEditing(true)}>Editar</button>
      )}

      <button onClick={handleDelete} style={{ color: 'red' }}>
        Excluir
      </button>
    </div>
  );
};

export default EditCategoryAndTypeItem ;