import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';

const Dashboard = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]);

  // Adicionar uma nova despesa ao Firestore
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      // Adiciona um novo documento à coleção 'expenses' do usuário logado
      await addDoc(collection(db, `users/${auth.currentUser.uid}/expenses`), {
        description,
        amount: parseFloat(amount),
        createdAt: new Date()
      });
      setDescription('');
      setAmount('');
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
    }
  };

  // Escutar as despesas em tempo real
  useEffect(() => {
    if (!auth.currentUser) return;

    // Cria uma referência para a coleção de despesas do usuário
    const expensesCollectionRef = collection(db, `users/${auth.currentUser.uid}/expenses`);
    
    // onSnapshot cria um observador que atualiza a lista de despesas em tempo real
    const unsubscribe = onSnapshot(expensesCollectionRef, (snapshot) => {
      const expenseList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expenseList);
    });

    // Limpa o observador quando o componente é desmontado
    return () => unsubscribe();
  }, []); // A array vazia garante que o efeito só roda uma vez

  return (
    <div>
      <h2>Adicionar Nova Despesa</h2>
      <form onSubmit={handleAddExpense}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor"
          required
        />
        <button type="submit">Adicionar</button>
      </form>

      <h2>Minhas Despesas</h2>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.description}: R${expense.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;