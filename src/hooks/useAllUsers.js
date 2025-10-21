// src/hooks/useAllUsers.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { fetchAllUsers } from '../services/userService';

const useAllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersRef, async () => {
            const data = await fetchAllUsers();
            setUsers(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { users, loading };
};

export default useAllUsers;
