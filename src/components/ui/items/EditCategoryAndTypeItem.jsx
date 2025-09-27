// src/components/ui/EditCategoryAndTypeItem.jsx

import React, { useState } from 'react';
// Importamos os hooks para as funções CRUD
import useCategories from '../../hooks/useCategories';
import useTypes from '../../hooks/useTypes';

// O componente agora aceita o item genérico, a flag isType, e a lista de tipos (se for categoria)
const EditCategoryAndTypeItem = ({ item, isType, allTypes = [], typeName = '' }) => {
    // Hooks de Funções CRUD
    const { updateCategory, deleteCategory } = useCategories();
    const { deleteType } = useTypes();
    
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
                    await deleteType(item.id);
                } else {
                    await deleteCategory(item.id);
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
                // OBS: Precisamos adicionar a função updateType no useTypes.js!
                // Por enquanto, vamos simular:
                // await updateType(item.id, trimmedName);
            } else {
                // Se for Categoria, atualizamos nome e/ou typeId
                await updateCategory(item.id, nameChanged ? trimmedName : null, typeChanged ? editedTypeId : null);
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
                            e.preventDefault(); // Evita submissão de formulário
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

            {/* Exibição e Edição do Tipo (Apenas para Categoria) */}
            {!isType && (
                isEditing ? (
                    <select
                        value={editedTypeId}
                        onChange={(e) => setEditedTypeId(e.target.value)}
                        onBlur={handleSaveEdit} // Salva ao mudar a seleção
                    >
                        {allTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                ) : (
                    <span style={{ fontSize: '0.9em', color: '#666' }}>
                        (Tipo: {typeName})
                    </span>
                )
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