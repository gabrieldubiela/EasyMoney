// src/components/ui/admin/DataManagement.jsx

import React, { useState } from 'react';
import { db } from '../../../../firebase/firebaseConfig';
import { useHousehold } from '../../../context/useHousehold';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

const DataManagement = () => {
    const { householdId } = useHousehold();
    const currentYear = new Date().getFullYear();
    
    const [yearToDelete, setYearToDelete] = useState(currentYear.toString());
    const [loading, setLoading] = useState(false);
    
    // Gera uma lista de anos para o seletor
    const yearsList = Array.from({ length: 10 }, (_, i) => currentYear - i).map(y => y.toString());

    // --- Lógica de Exclusão em Massa ---
    const handleDeleteData = async (e) => {
        e.preventDefault();
        
        if (!householdId || !yearToDelete) {
            alert("Erro: Household ID e Ano são obrigatórios.");
            return;
        }

        // Confirmação de Segurança EXTREMA
        const confirmation = window.prompt(
            `ATENÇÃO: Você está prestes a DELETAR TODAS as transações do ano ${yearToDelete} (REAIS e PLANEJADAS).\n\nDIGITE O ANO ${yearToDelete} PARA CONFIRMAR A EXCLUSÃO IRREVERSÍVEL:`
        );

        if (confirmation !== yearToDelete) {
            alert("Confirmação falhou. Nenhuma transação foi excluída.");
            return;
        }

        setLoading(true);

        try {
            // 1. Prepara a busca por Transações Reais
            const transactionsRef = collection(db, `households/${householdId}/transactions`);
            // Filtragem pelo campo yearMonth (Ex: '202201' a '202212')
            const startYearMonth = yearToDelete + '01';
            const endYearMonth = yearToDelete + '12';

            const transactionsQuery = query(
                transactionsRef,
                where('yearMonth', '>=', startYearMonth),
                where('yearMonth', '<=', endYearMonth)
            );
            const transactionsSnapshot = await getDocs(transactionsQuery);

            // 2. Prepara a busca por Transações Planejadas
            const plannedRef = collection(db, `households/${householdId}/plannedTransactions`);
            // Nota: O filtro é mais complexo aqui, pois a data é um Timestamp.
            const startTimestamp = new Date(parseInt(yearToDelete), 0, 1);
            const endTimestamp = new Date(parseInt(yearToDelete) + 1, 0, 1);

            const plannedQuery = query(
                plannedRef,
                where('paymentDate', '>=', startTimestamp),
                where('paymentDate', '<', endTimestamp)
            );
            const plannedSnapshot = await getDocs(plannedQuery);
            
            // 3. Executa o Batch de Exclusão
            const batch = writeBatch(db);
            let count = 0;

            transactionsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                count++;
            });

            plannedSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                count++;
            });

            if (count === 0) {
                alert(`Nenhuma transação encontrada no ano ${yearToDelete} para exclusão.`);
            } else {
                await batch.commit();
                alert(`Sucesso! ${count} transações (reais e planejadas) do ano ${yearToDelete} foram excluídas permanentemente.`);
            }

        } catch (error) {
            console.error('Erro na exclusão em massa:', error);
            alert('Falha crítica ao tentar excluir transações. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };
    // ------------------------------------------

    return (
        <div>
            <h3>Manutenção e Limpeza de Dados</h3>
            <p>Esta seção permite a exclusão em massa de dados antigos ou de teste. **ESTA AÇÃO É IRREVERSÍVEL.**</p>
            
            <form onSubmit={handleDeleteData}>
                <h4>Excluir Transações por Ano</h4>
                
                <label htmlFor="year-select">Selecione o Ano para Excluir:</label>
                <select 
                    id="year-select"
                    value={yearToDelete} 
                    onChange={(e) => setYearToDelete(e.target.value)} 
                    disabled={loading}
                >
                    {yearsList.map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
                
                <p style={{ color: 'red', fontWeight: 'bold' }}>
                    Atenção: Serão excluídas todas as transações REAIS e PLANEJADAS desse ano.
                </p>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ backgroundColor: 'darkred', color: 'white', padding: '10px', marginTop: '10px' }}
                >
                    {loading ? 'PROCESSANDO EXCLUSÃO...' : `DELETAR DADOS DE ${yearToDelete}`}
                </button>
            </form>
            
            {/* Outras ferramentas de manutenção podem ser adicionadas aqui (ex: Reindexar, Corrigir Orçamentos) */}
        </div>
    );
};

export default DataManagement;