// src/hooks/useAllUsers.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Hook para escutar todos os usuários em tempo real.
 * Atualiza automaticamente quando qualquer usuário é adicionado, editado ou removido.
 *
 * @returns {object} { users, loading, error }
 */
const useAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    const usersRef = collection(db, 'users');

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao escutar usuários:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { users, loading, error };
};

export default useAllUsers;
