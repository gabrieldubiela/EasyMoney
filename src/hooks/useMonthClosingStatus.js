// src/hooks/useMonthClosingStatus.js

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore'; 
import { useHousehold } from '../context/useHousehold';

/**
 * Hook para verificar se o mês anterior foi formalmente fechado (com rollover calculado).
 * A verificação é feita buscando um documento de monthlyBudget com a flag 'isClosed'.
 */
const useMonthClosingStatus = () => {
    const { householdId } = useHousehold();
    const [needsClosing, setNeedsClosing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!householdId) return;

        const checkStatus = async () => {
            setLoading(true);
            const today = new Date();
            // Calcula o mês anterior
            const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            
            const yearMonth = `${prevMonthDate.getFullYear()}${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
            const monthName = prevMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            
            // 1. Busca qualquer documento do mês anterior.
            // A premissa é que o closeMonthAndCalculateRollover cria/atualiza o documento do mês anterior com isClosed: true.
            const budgetRef = doc(db, `households/${householdId}/monthlyBudgets`, yearMonth);

            try {
                const docSnap = await getDoc(budgetRef);
                
                // Se o documento existe e NÃO está marcado como isClosed: true, precisa fechar.
                // Se não existe, também precisamos fechar (é a primeira vez).
                if (!docSnap.exists() || docSnap.data().isClosed !== true) {
                    setNeedsClosing({ yearMonth, monthName, hasData: docSnap.exists() });
                } else {
                    setNeedsClosing(false);
                }
            } catch (error) {
                console.error("Erro ao verificar status de fechamento de mês:", error);
                setNeedsClosing(false); 
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [householdId]);

    // Retorna { yearMonth, monthName, hasData } se precisar fechar, ou false se OK
    return { needsClosing, loading };
};

export default useMonthClosingStatus;