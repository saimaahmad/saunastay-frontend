import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const ProtectedAdminRoute = ({ children }) => {
  const { currentUser, authLoading } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;
        setIsAdmin(role === 'admin');
      }
    };

    checkAdmin();
  }, [currentUser]);

  if (authLoading || isAdmin === null) return <div>Loading...</div>;

  return currentUser && isAdmin ? children : <Navigate to="/" />;
};

export default ProtectedAdminRoute;
