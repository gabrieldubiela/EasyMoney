// src/components/ui/forms/TransactionForm.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useAppContext } from '../../context/AppContext';
import { saveTransaction } from '../../services/transactionService';

const TransactionForm = ({ transactionId, onSaveSuccess, isPlanned }) => {
  const { householdId, user } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const today = new Date().toISOString().substring(0, 10);

  // Estados do formulário
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState(today);
  const [installments, setInstallments] = useState(1);

  // Metadados
  const [categories, setCategories] = useState([]);
  const [typesList, setTypesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega categorias e tipos
  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    const catRef = collection(db, `households/${householdId}/categories`);
    const unsubCat = onSnapshot(catRef, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });

    const typeRef = collection(db, `households/${householdId}/types`);
    const unsubType = onSnapshot(typeRef, (snapshot) => {
      setTypesList(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
      setLoading(false);
    });

    return () => {
      unsubCat();
      unsubType();
    };
  }, [householdId]);

  // Verifica se o tipo selecionado é receita
  const isIncomeType = (selectedTypeId) => {
    const transactionType = typesList.find(t => t.id === selectedTypeId);
    return transactionType && transactionType.name.toUpperCase() === 'RECEITA';
  };

  // Retorna valor com sinal correto
  const getSignedAmount = (rawAmount, typeId) => {
    const numeric = parseFloat(rawAmount);
    if (isNaN(numeric) || numeric <= 0) throw new Error('Insira um valor positivo.');
    return isIncomeType(typeId) ? numeric : -numeric;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const signedAmount = getSignedAmount(amount, type);

      if (isPlanned) {
        // Salva como transação planejada
        await addDoc(collection(db, `households/${householdId}/plannedTransactions`), {
          description: description.trim(),
          supplier: supplier.trim(),
          amount: signedAmount,
          category_id: category,
          type_id: type,
          paymentDate: new Date(date + 'T00:00:00'),
          user_id: user.uid,
          isPaid: false,
          createdAt: serverTimestamp()
        });
      } else {
        // Salva como transação efetiva
        await saveTransaction({
          householdId,
          userId: user.uid,
          formData: { description: description.trim(), supplier: supplier.trim(), amount: signedAmount, category, type, date, installments },
          editingData: { transactionId, transactionGroupId: null }
        });
      }

      alert('Transação salva com sucesso!');
      if (onSaveSuccess) onSaveSuccess();

      // Limpa o formulário
      setDescription('');
      setSupplier('');
      setAmount('');
      setCategory('');
      setType('');
      setDate(today);
      setInstallments(1);

    } catch (error) {
      alert(`Erro ao salvar: ${error.message}`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="loading">Carregando dados...</div>;
  if (categories.length === 0 || typesList.length === 0) return <div className="alert alert-info">Configure categorias e tipos antes de adicionar transações.</div>;

  return (
    <form onSubmit={handleSave} className="form">
      <div className="form-group">
        <input type="text" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="form-group">
        <input type="text" placeholder="Fornecedor/Origem" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
      </div>
      <div className="form-group">
        <input type="number" placeholder="Valor" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
      </div>
      <div className="form-group">
        <label className="form-label">Data</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      {!isPlanned && (
        <div className="form-group">
          <label className="form-label">Parcelas</label>
          <input type="number" value={installments} onChange={(e) => setInstallments(e.target.value)} min="1" />
        </div>
      )}

      <div className="form-group">
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>Categoria</option>
          {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
        </select>
      </div>

      <div className="form-group">
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="" disabled>Tipo</option>
          {typesList.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
      </div>

      <button type="submit" disabled={isProcessing} className="primary btn-block">
        {isProcessing ? 'Processando...' : (transactionId ? 'Salvar Edição' : 'Adicionar Transação')}
      </button>
    </form>
  );
};

export default TransactionForm;
