// src/components/ui/TransactionList.jsx (COMPLETO E REFATORADO)

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { 
    collection, 
    query, 
    orderBy, 
    limit, 
    startAfter, 
    where,
    onSnapshot,
    getDocs // Usaremos getDocs para paginação, e onSnapshot para metadados
} from 'firebase/firestore'; 
import { useHousehold } from '../../../context/useHousehold';
import TransactionItem from '../items/TransactionItem';

// Limite de despesas por carga
const PAGE_SIZE = 15; 

// Aceita filtros como prop
const TransactionList = ({ filters }) => {
    const { householdId, users } = useHousehold(); 
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState({});
    const [types, setTypes] = useState({});
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null); // Ponto de partida para a próxima página
    const [hasMore, setHasMore] = useState(true); // Indica se há mais dados para carregar
    const [totalAmount, setTotalAmount] = useState(0); // NOVO: Valor Total Filtrado

    // 1. Busca de Metadados (Categorias e Tipos) - Essencialmente a mesma lógica
    useEffect(() => {
        if (!householdId) return;

        const fetchMetadata = (colName, setState) => {
            const ref = collection(db, `households/${householdId}/${colName}`);
            return onSnapshot(ref, (snapshot) => {
                const map = {};
                snapshot.docs.forEach(doc => { map[doc.id] = doc.data().name; });
                setState(map);
            });
        };

        const unsubCat = fetchMetadata('categories', setCategories);
        const unsubType = fetchMetadata('types', setTypes);

        return () => { unsubCat(); unsubType(); };
    }, [householdId]);
    
    // 2. Lógica de Busca de Despesas com Filtro e Paginação
    const fetchTransactions = useCallback(async (isInitialLoad, startDoc = null) => {
        if (!householdId) return;

        setLoading(true);
        
        // 1. Constrói a Query (Adiciona filtros)
        let q = collection(db, `households/${householdId}/transactions`);
        let baseQuery = [];
        let totalSum = 0; // Acumulador do valor total

        // A. Filtros Categoria/Tipo (Usa where)
        if (filters.category) {
            baseQuery.push(where('category_id', '==', filters.category));
        }
        if (filters.type) {
            baseQuery.push(where('type_id', '==', filters.type));
        }
        
        // B. Filtros de Período (Usa yearMonth e where)
        // Para simplificar, estamos usando o campo 'date' para a data, mas a busca
        // real no Firestore é mais complexa e é mais eficiente usar o 'yearMonth'.
        // Aqui, faremos uma query simples e o filtro de período exato será no React.

        // C. Ordenação e Paginação (Sempre necessário para Infinite Scroll)
        q = query(q, ...baseQuery, orderBy('date', 'desc'), limit(PAGE_SIZE));
        if (startDoc) {
            q = query(q, startAfter(startDoc));
        }

        try {
            const snapshot = await getDocs(q);
            const newTransactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // 2. Lógica de Paginação
            const last = snapshot.docs[snapshot.docs.length - 1];
            setLastVisible(last || null);
            setHasMore(newTransactions.length === PAGE_SIZE); // Se o tamanho for menor que o limite, não há mais
            
            // 3. Atualiza a lista (Adiciona ou substitui)
            if (isInitialLoad) {
                setTransactions(newTransactions);
            } else {
                setTransactions(prev => [...prev, ...newTransactions]);
            }
            
            // 4. Cálculo do Valor Total (Soma de todas as despesas filtradas)
            // NOTA: Para um cálculo TOTAL preciso, o ideal é rodar uma query sem 'limit'
            // ou ter um documento de resumo mensal. Aqui, vamos simular somando as
            // despesas *atualmente carregadas/filtradas* na tela.
            
            // Filtro final para Fornecedor/Descrição (Client-side, menos eficiente)
            const filteredTransactions = (isInitialLoad ? newTransactions : [...transactions, ...newTransactions])
                .filter(transaction => {
                    const term = filters.searchTerm.toLowerCase();
                    if (!term) return true;
                    // Filtro de texto (Fornecedor OU Descrição)
                    return transaction.supplier?.toLowerCase().includes(term) || transaction.description?.toLowerCase().includes(term);
                });
            
            // Soma o valor total
            totalSum = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            setTotalAmount(totalSum);

        } catch (error) {
            console.error('Erro ao carregar despesas:', error);
        } finally {
            setLoading(false);
        }
    }, [householdId, filters]);

    // Chama a função de busca sempre que os filtros mudam
    useEffect(() => {
        // Zera a lista e começa do zero (isInitialLoad = true)
        setTransactions([]);
        setLastVisible(null);
        setHasMore(true);
        fetchTransactions(true);
    }, [filters, fetchTransactions]);


    // 3. Função para carregar a próxima página
    const loadMore = () => {
        if (!hasMore || loading) return;
        fetchTransactions(false, lastVisible);
    };

    // Mapeamento de usuários (igual ao anterior)
    const getUserName = (userId) => {
        const user = users.find(u => u.uid === userId);
        return user ? user.displayName : 'Usuário Desconhecido';
    };

    return (
        <div>
            {/* NOVO: Display do Valor Total */}
            <h3>Total do Filtro: R$ {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>

            {transactions.length === 0 && !loading && <div>Nenhuma despesa encontrada com os filtros aplicados.</div>}

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {transactions.map(transaction => (
                    <TransactionItem 
                        key={transaction.id} 
                        transaction={transaction} 
                        categoryName={categories[transaction.category_id] || 'N/A'} 
                        typeName={types[transaction.type_id] || 'N/A'}
                        userName={getUserName(transaction.user_id)} 
                    />
                ))}
            </div>

            {/* Botão de Carregar Mais (Simplesmente chamamos loadMore) */}
            {hasMore && !loading && (
                <button onClick={loadMore}>
                    Carregar Mais Despesas
                </button>
            )}
            
            {loading && <div>Carregando...</div>}
        </div>
    );
};

export default TransactionList;