import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
   getAuth,
    setPersistence, 
 browserSessionPersistence,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Login = ({ onClose, goToSignup }) => {
  const { t } = useTranslation();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const auth = getAuth();

  const saveUserSession = (user, role) => {
    const userData = {
      name: user.displayName || 'User',
      email: user.email,
      role,
    };
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error(t('pleaseEnterEmailAndPassword'));
      return;
    }
    setLoading(true);
    try {
        await setPersistence(auth, browserSessionPersistence); // 👈 add this
      const result = await signInWithEmailAndPassword(auth, email, password);
      const loginEmail = result.user.email.toLowerCase();
      const userSnap = await getDoc(doc(db, 'users', loginEmail));

      if (userSnap.exists()) {
        const role = userSnap.data().role || 'user';
        saveUserSession(result.user, role);
        toast.success(t('welcomeBack'));
        onClose?.();
        navigate(role === 'owner' ? '/owner/home' : '/');
      } else {
        toast.error(t('accountNotFound'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
       await setPersistence(auth, browserSessionPersistence); // 👈 add thi
      const result   = await signInWithPopup(auth, provider);
      const loginEmail = result.user.email.toLowerCase();
      const userSnap = await getDoc(doc(db, 'users', loginEmail));

      if (userSnap.exists()) {
        const role = userSnap.data().role || 'user';
        saveUserSession(result.user, role);
        toast.success(t('loggedInSuccessfully'));
        onClose?.();
        navigate(role === 'owner' ? '/owner/home' : '/');
      } else {
        toast.error(t('googleAccountNotRegistered'));
        await auth.signOut();
      }
    } catch (err) {
      console.error(err);
      toast.error(t('googleSignInFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error(t('pleaseEnterYourEmail'));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(t('passwordResetEmailSent'));
    } catch (err) {
      console.error(err);
      toast.error(t('failedToSendResetEmail'));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 sm:mt-16 px-4 sm:px-8">
      <div className="bg-[#f3dcb9] p-6 sm:p-8 rounded-md relative shadow-lg">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
          disabled={loading}
          aria-label={t('close')}
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-[#243a26] mb-6">
          {t('loginTitle')}
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder={t('emailPlaceholder')}
          className="w-full border p-2 rounded mb-3 bg-[#fdf5e9] text-sm"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />

        {/* Password */}
        <input
          type="password"
          placeholder={t('passwordPlaceholder')}
          className="w-full border p-2 rounded mb-2 bg-[#fdf5e9] text-sm"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />

        {/* Forgot */}
        <div className="text-right mb-4">
          <button
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:underline"
            disabled={loading}
            type="button"
          >
            {t('forgotPassword')}
          </button>
        </div>

        {/* Log In */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-[#4d603e] text-white py-2 rounded hover:bg-[#3a4f2e] text-sm sm:text-base ${
            loading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {loading ? t('loading') : t('logIn')}
        </button>

        {/* Google */}
        <div className="text-center mt-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`bg-white border px-4 py-2 rounded shadow hover:shadow-md flex items-center gap-2 justify-center w-full text-sm sm:text-base ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <img src="/images/google-icon.png" alt="Google" className="w-5 h-5" />
            <span>{t('continueWithGoogle')}</span>
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-sm text-center text-gray-700 mt-6">
          {t('noAccount')}{' '}
          <button
            onClick={goToSignup}
            className="underline text-[#4d603e]"
            disabled={loading}
            type="button"
          >
            {t('signUp')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
