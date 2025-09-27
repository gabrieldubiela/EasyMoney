// src/hooks/useAllUsers.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 

/**
 * Hook personalizado para buscar e monitorar todos os perfis de usuário da coleção 'users'.
 * NOTA: Esta função só deve ser usada por administradores, pois carrega TODOS os usuários.
 */
const useAllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const usersRef = collection(db, 'users');
        // Ordena por email para facilitar a visualização
        const q = query(usersRef, orderBy('email', 'asc')); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                email: doc.data().email || 'Email Não Definido', // Garante que o email existe
            }));
            setUsers(usersList);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Erro ao carregar lista de usuários:", err);
            setError("Falha ao carregar lista de usuários.");
            setLoading(false);
        });

        // Limpeza
        return () => unsubscribe();
    }, []);

    return { users, loading, error };
};

export default useAllUsers;