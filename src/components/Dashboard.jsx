import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
// NOVO: Importa o hook customizado
import { useHousehold } from '../context/useHousehold'; 
import AddExpenseForm from './AddExpenseForm'; 
import ExpenseList from './ExpenseList'; 

const Dashboard = () => {
  // NOVO: Obtém os dados do Context API. 
  // O estado de autenticação e busca de ID não estão mais aqui.
  const { householdId, currentUserName } = useHousehold(); 
  
  const [expenses, setExpenses] = useState([]);
  
  // REMOVIDO: const [householdId, setHouseholdId] = useState(null);
  // REMOVIDO: const [currentUserName, setCurrentUserName] = useState(''); 
  
  // REMOVIDO: O useEffect de onAuthStateChanged (primeiro useEffect)
  //          Foi movido para o HouseholdContext.jsx
  
  // Efeito para escutar as despesas em tempo real (Mantém)
  // Este useEffect agora depende da variável householdId que vem do Context
  useEffect(() => {
    if (!householdId) return; // Se o ID ainda não carregou ou não existe, sai

    const expensesCollectionRef = collection(db, `households/${householdId}/expenses`);
    const unsubscribe = onSnapshot(expensesCollectionRef, (snapshot) => {
      const expenseList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expenseList);
    });

    return () => unsubscribe();
  }, [householdId]);

  return (
    <div>
      {/* Passando props do Contexto para o formulário */}
      <AddExpenseForm 
        householdId={householdId} 
        currentUserName={currentUserName} 
      />

      <h2>Minhas Despesas</h2>
      
      {/* Não passamos onDelete, pois a lógica está no ExpenseItem agora */}
      <ExpenseList expenses={expenses} /> 
      
    </div>
  );
};

export default Dashboard;