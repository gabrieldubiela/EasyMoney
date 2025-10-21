// src/components/ui/EditCategoryAndTypeItem.jsx

import React, { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { updateCategory, deleteCategory } from '../../services/categoryService';
import { updateType, deleteType } from '../../services/typeService';

// O componente agora aceita o item genérico, a flag isType, e a lista de tipos (se for categoria)
const EditCategoryAndTypeItem = ({ item, isType }) => {
    const { householdId } = useAppContext();
    
    // O item pode ser uma Categoria ou um Tipo, mas ambos têm 'id' e 'name'
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(item.name);
    
    // NOVO: Estado para editar o Tipo (apenas se for Categoria)
    const [editedTypeId, setEditedTypeId] = useState(item.typeId || ''); 

    // Define qual função de exclusão usar
    const handleDelete = async () => {
        const itemType = isType ? 'Tipo' : 'Categoria';
        
        if (window.confirm(`Tem certeza que deseja excluir o ${itemType} "${item.name}"?`)) {
            try {
                if (isType) {
                    await deleteType(householdId, item.id);
                } else {
                    await deleteCategory(householdId, item.id);
                }
                console.log(`${itemType} ${item.name} excluído com sucesso!`);
            } catch (error) {
                console.error(`Erro ao excluir ${itemType}:`, error);
                alert(`Erro ao excluir ${itemType}. Verifique o console.`);
            }
        }
    };

    // Define qual função de salvamento usar
    const handleSaveEdit = async () => {
        const trimmedName = editedName.trim();
        const itemType = isType ? 'Tipo' : 'Categoria';

        // 1. Verifica se houve mudança
        const nameChanged = trimmedName !== item.name;
        const typeChanged = !isType && editedTypeId !== item.typeId;

        if (!nameChanged && !typeChanged) {
            setIsEditing(false);
            setEditedName(item.name);
            setEditedTypeId(item.typeId || '');
            return;
        }
        
        try {
            if (isType) {
                // Se for um Tipo, apenas o nome é editável (usamos updateDoc do hook de types)
                await updateType(householdId, item.id, trimmedName);
            } else {
                // Se for Categoria, atualizamos nome e/ou typeId
                await updateCategory(householdId, item.id, nameChanged ? trimmedName : null);
            }

            setIsEditing(false);
            console.log(`${itemType} ${item.id} atualizado.`);
        } catch (error) {
            console.error(`Erro ao salvar edição do ${itemType}:`, error);
            alert(`Erro ao salvar a edição do ${itemType}.`);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            
            {isEditing ? (
                <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    // Salva ao pressionar Enter ou perder o foco
                    onBlur={handleSaveEdit} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit();
                        }
                        if (e.key === 'Escape') {
                            setIsEditing(false);
                            setEditedName(item.name);
                            setEditedTypeId(item.typeId || '');
                        }
                    }}
                    autoFocus
                />
            ) : (
                <span onDoubleClick={() => setIsEditing(true)} style={{ fontWeight: 'bold' }}>
                    {item.name}
                </span>
            )}

            {/* Botões de Ação */}
            <div>
                {isEditing ? (
                    <button onClick={handleSaveEdit}>Salvar</button>
                ) : (
                    <button onClick={() => setIsEditing(true)}>Editar</button>
                )}

                <button onClick={handleDelete} style={{ color: 'red', marginLeft: '5px' }}>
                    Excluir
                </button>
            </div>
        </div>
    );
};

export default EditCategoryAndTypeItem;