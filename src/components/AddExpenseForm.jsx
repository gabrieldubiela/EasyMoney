// src/components/AddExpenseForm.jsx

import React, { useState } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const AddExpenseForm = ({ householdId, currentUserName }) => {
  // Estados locais para os campos do formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState('');
  const [tipo, setTipo] = useState('');

  const handleAddExpense = async (e) => {
    e.preventDefault();
    // Verifica se os campos obrigatórios estão preenchidos
    if (!description || !amount || !householdId) {
      alert("Descrição, Valor e ID da Família são obrigatórios.");
      return;
    }

    // Verifica se o valor é um número válido
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("O valor deve ser um número positivo.");
      return;
    }

    try {
      // O caminho para a subcoleção de despesas
      const expensesCollectionRef = collection(db, `households/${householdId}/expenses`);
      
      await addDoc(expensesCollectionRef, {
        description,
        amount: parsedAmount,
        fornecedor,
        categoria,
        data,
        tipo,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        userName: currentUserName // Usa o nome passado via prop
      });
      
      // Limpar o formulário após o sucesso
      setDescription('');
      setAmount('');
      setFornecedor('');
      setCategoria('');
      setData('');
      setTipo('');

    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      alert('Erro ao adicionar despesa. Tente novamente.');
    }
  };

  if (!householdId) {
    return <p>Carregando dados do usuário...</p>;
  }

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
    </div>
  );
};

export default AddExpenseForm;