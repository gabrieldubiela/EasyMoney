// src/pages/SettingsPage.jsx

import React, { useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import useAllTypes from '../hooks/useAllTypes';
import useAllCategories from '../hooks/useAllCategories';
import CategoryForm from '../components/forms/CategoryForm';
import TypeForm from '../components/forms/TypeForm';
import AlertForm from '../components/forms/AlertForm';

const SettingsPage = () => {
    const { householdId, isLoading: householdLoading } = useAppContext();
    const { types, loading: typesLoading, refreshTypes } = useAllTypes();
    const { categories, loading: categoriesLoading, refreshCategories } = useAllCategories();

    const [editingType, setEditingType] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    const isLoading = householdLoading || typesLoading || categoriesLoading;

    if (isLoading) {
        return <div className="loading">Carregando configurações...</div>;
    }

    if (!householdId) {
        return <div className="error">Você precisa estar em uma família para gerenciar configurações.</div>;
    }

    return (
        <div>
            <h1>Configurações</h1>

            {/* ========== SEÇÃO 1: TIPOS ========== */}
            <section>
                <h2>1. Tipos de Transação ({types.length})</h2>

                {/* Formulário para adicionar novo tipo */}
                {!editingType && (
                    <TypeForm
                        existingTypes={types}
                        onSuccess={() => refreshTypes?.()}
                  />
                )}

                {/* Lista de tipos existentes */}
                <div>
                    {types.map((typeItem) => (
                        <div key={typeItem.id}>
                            {editingType?.id === typeItem.id ? (
                                <TypeForm
                                    item={typeItem}
                                    existingTypes={types}
                                    onSuccess={() => {
                                        refreshTypes?.();
                                        setEditingType(null);
                                    }}
                                    onCancel={() => setEditingType(null)}
                              />
                            ) : (
                                <div>
                                    <span>
                                        <strong>{typeItem.name}</strong> {typeItem.isIncome ? '(Receita)' : '(Despesa)'}
                                    </span>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditingType(typeItem)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <hr/>

            {/* ========== SEÇÃO 2: CATEGORIAS ========== */}
            <section>
                <h2>2. Categorias ({categories.length})</h2>

                {/* Formulário para adicionar nova categoria */}
                {!editingCategory && (
                    <CategoryForm
                        existingCategories={categories}
                        onSuccess={() => refreshCategories?.()}
                  />
                )}

                {/* Lista de categorias existentes */}
                <div>
                    {categories.map((category) => (
                        <div key={category.id}>
                            {editingCategory?.id === category.id ? (
                                <CategoryForm
                                    item={category}
                                    existingCategories={categories}
                                    onSuccess={() => {
                                        refreshCategories?.();
                                        setEditingCategory(null);
                                    }}
                                    onCancel={() => setEditingCategory(null)}
                              />
                            ) : (
                                <div>
                                    <span>
                                        <strong>{category.name}</strong>
                                    </span>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditingCategory(category)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <hr/>

            {/* ========== SEÇÃO 3: ALERTAS ========== */}
            <section>
                <h2>3. Gestão de Alertas</h2>
                <p>Visualize e gerencie alertas de orçamento:</p>
                <AlertForm/>
            </section>
        </div>
    );
};

export default SettingsPage;
