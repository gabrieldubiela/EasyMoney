import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Dashboard = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState('');
  const [tipo, setTipo] = useState('');
  
  const [expenses, setExpenses] = useState([]);
  const [householdId, setHouseholdId] = useState(null);

  // Efeito para encontrar o ID da família do usuário
  useEffect(() => {
    // onAuthStateChanged é um observador que detecta mudanças no estado do usuário
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Busca o documento do usuário na coleção 'users'
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().householdId) {
          // Se o documento existe e tem um householdId, ele é salvo no estado
          setHouseholdId(userDocSnap.data().householdId);
        } else {
          console.error("ID da família não encontrado no documento do usuário.");
        }
      }
    });

    // Retorna a função de limpeza do observador
    return () => unsubscribeAuth();
  }, []);

  // Efeito para escutar as despesas em tempo real
  useEffect(() => {
    if (!householdId) return;

    // A referência agora aponta para a coleção da família
    const expensesCollectionRef = collection(db, `households/${householdId}/expenses`);
    
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
  }, [householdId]);

  // Função para adicionar uma nova despesa
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description || !amount || !householdId) return;

    try {
      const expensesCollectionRef = collection(db, `households/${householdId}/expenses`);
      await addDoc(expensesCollectionRef, {
        description,
        amount: parseFloat(amount),
        fornecedor,
        categoria,
        data,
        tipo,
        createdAt: new Date(),
        userId: auth.currentUser.uid // Salva o ID do usuário que criou a despesa
      });
      setDescription('');
      setAmount('');
      setFornecedor('');
      setCategoria('');
      setData('');
      setTipo('');
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
    }
  };

  return (
    <div>
      <h2>Adicionar Nova Despesa</h2>
      <form onSubmit={handleAddExpense}>
        <input
          type="text"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          placeholder="Fornecedor"
        />
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoria"
        />
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
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Data"
        />
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Tipo"
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