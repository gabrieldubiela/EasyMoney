// src/hooks/useMonthClosingStatus.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook responsável por verificar o status de fechamento do mês anterior.
 * 
 * - Verifica se o documento de orçamento (`households/${householdId}/monthlyClosings/{yearMonth}`) do mês anterior
 *   existe e contém a flag `isClosed: true`.
 * - Caso contrário, sinaliza que o fechamento é necessário.
 * 
 * Utilidade:
 *   Garante integridade contábil antes de cálculos de rollover e performance.
 * 
 * @returns {object} { needsClosing, loading }
 *    - needsClosing: { yearMonth, monthName, hasData } ou false
 *    - loading: boolean
 */
export default function useMonthClosingStatus() {
  const { householdId } = useAppContext();
  const [needsClosing, setNeedsClosing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) return;

    const checkStatus = async () => {
      try {
        setLoading(true);

        const today = new Date();
        const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const yearMonth = `${prevMonthDate.getFullYear()}${String(
          prevMonthDate.getMonth() + 1
        ).padStart(2, '0')}`;
        const monthName = prevMonthDate.toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        });

        // Referência direta ao documento do mês anterior
        const closingRef = doc(db, `households/${householdId}/monthlyClosings`, yearMonth);
        const closingSnap = await getDoc(closingRef);

        if (!closingSnap.exists() || closingSnap.data().isClosed !== true) {
          setNeedsClosing({ yearMonth, monthName, hasData: closingSnap.exists() });
        } else {
          setNeedsClosing(false);
        }

      } catch (error) {
        console.error('Erro ao verificar status de fechamento:', error);
        setNeedsClosing(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [householdId]);

  return { needsClosing, loading };
}
