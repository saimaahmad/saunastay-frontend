import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';



const LoginStep = ({ goToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
 const loginWithEmail = async () => {
  if (!email || !password) {
    toast.error(t('enterEmailPassword'));
    return;
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const loginEmail = result.user.email.toLowerCase();
    const userRef = doc(db, 'users', loginEmail);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      toast.error(t('accountNotFound'));
      console.log("❌ User document not found");
      goToSignup?.();
      return;
    }

    const userData = userSnap.data();
    console.log("✅ User data from Firestore:", userData);

    const role = userData.roles || userData.role || 'user'; // check both keys just in case

    if (role !== 'owner') {
      toast.error(t('notOwnerAccount'));
      console.log("❌ User is not an owner:", role);
      return;
    }

    localStorage.setItem('user', JSON.stringify({
      name: userData.name || 'User',
      email: loginEmail,
      role,
    }));

    toast.success(`${t('welcome')}, ${userData.name || t('user')}!`);
    onLoginSuccess?.();
  } catch (err) {
    console.error('Login error:', err.message);
    toast.error(t('invalidCredentials'));
  }
};


 const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const loginEmail = result.user.email.toLowerCase();

    const userRef = doc(db, 'users', loginEmail);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      toast.warn(t('googleNotRegistered'));
      console.log("❌ Google user not found in Firestore");
      goToSignup?.();
      return;
    }

    const userData = userSnap.data();
    console.log("✅ Google user data:", userData);

    const role = userData.roles || userData.role || 'user';

    if (role !== 'owner') {
      toast.error(t('notOwnerAccount'));
      console.log("❌ Google user is not an owner:", role);
      return;
    }

    localStorage.setItem('user', JSON.stringify({
      name: result.user.displayName || 'User',
      email: loginEmail,
      role,
    }));

    toast.success(`${t('welcome')}, ${result.user.displayName || t('user')}!`);
    onLoginSuccess?.();
  } catch (err) {
    console.error('Google sign-in error:', err.message);
    toast.error(t('googleLoginFailed'));
  }
};


  return (
    <div className="bg-[#eee1ce] px-6 py-12">
      <div className="max-w-md mx-auto bg-[#eee1ce] p-8 shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center text-[#243a26] mb-6">
  🔐 {t('loginToContinue')}
        </h2>

        <input
          type="email"
          placeholder="Email"
           className="w-full border p-2 rounded mb-3 bg-[#fdf5e9]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4 bg-[#fdf5e9]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={loginWithEmail}
          className="w-full bg-[#4d603e] text-white py-2 rounded hover:bg-[#3a4f2e]"
        >
          {t('login')}
        </button>

        <div className="text-center mt-5">
          <button
            onClick={loginWithGoogle}
            className="bg-white border px-4 py-2 rounded shadow hover:shadow-md flex items-center gap-2 justify-center w-full"
          >
            <img src="/images/google-icon.png" alt="Google" className="w-5 h-5" />
            <span>{t('continueWithGoogle')}</span>
          </button>
        </div>

        <p className="text-sm text-center text-gray-600 mt-6">
          {t('noAccount')}{' '}
          <button onClick={goToSignup} className="underline text-[#4d603e]">
              {t('signup')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginStep;
