import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { AiOutlineClose } from 'react-icons/ai';

const SignUpStep = ({ onClose }) => {
  const { t } = useTranslation();
  const [name,     setName]     = useState('');
  const [contact,  setContact]  = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const role = 'owner'; // 🔒 Hardcoded role

  const navigate = useNavigate();

  const saveUserToFirestore = async (user) => {
    const ref = doc(db, 'users', user.email.toLowerCase());
    await setDoc(ref, {
      name,
      email: user.email.toLowerCase(),
      contact,
      role
    });
    localStorage.setItem('user', JSON.stringify({ name, email: user.email, role }));
  };

  const handleSignup = async () => {
    if (!name || !contact || !email || !password) {
      toast.error(t('fillAllFields'));
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await saveUserToFirestore(result.user);
      toast.success(t('signupSuccess'));
      onClose?.();
      navigate('/owner/home');
    } catch (err) {
      console.error(err);
      toast.error(t('signupFailure'));
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      const existing = await getDoc(doc(db, 'users', result.user.email.toLowerCase()));
      if (existing.exists()) {
        toast.error(t('googleAlready'));
        return;
      }
      await saveUserToFirestore(result.user);
      toast.success(t('signupSuccess'));
      onClose?.();
      navigate('/owner/home');
    } catch (err) {
      console.error(err);
      toast.error(t('googleSignupFail'));
    }
  };

  return (
    <div className="bg-[#eee1ce] p-6 rounded-md w-full max-w-md shadow-xl mx-auto mt-16 relative">
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label={t('close')}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
      >
        <AiOutlineClose size={20} />
      </button>

      <h2 className="text-xl font-bold text-center text-[#243a26] mb-4">
        {t('signupTitle')}
      </h2>

      <input  
        type="text"
        placeholder={t('fullName')}
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full border p-2 mb-3 rounded bg-[#fdf5e9]"
      />
      <input
        type="text"
        placeholder={t('contactNumber')}
        value={contact}
        onChange={e => setContact(e.target.value)}
        className="w-full border p-2 mb-3 rounded bg-[#fdf5e9]"
      />
      <input
        type="email"
        placeholder={t('emailAddress')}
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full border p-2 mb-3 rounded bg-[#fdf5e9]"
      />
      <input
        type="password"
        placeholder={t('password')}
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full border p-2 mb-4 rounded bg-[#fdf5e9]"
      />

      {/* No role selection UI shown here since role is always 'owner' */}

      <button
        onClick={handleSignup}
        className="w-full bg-[#4d603e] text-white py-2 rounded hover:bg-[#3a4f2e] mb-3"
      >
        {t('signUp')}
      </button>

      <button
        onClick={handleGoogleSignup}
        className="w-full border py-2 rounded flex items-center justify-center gap-2 shadow hover:shadow-md"
      >
        <img src="/images/google-icon.png" alt="Google" className="w-5 h-5" />
        <span>{t('signUpWithGoogle')}</span>
      </button>
    </div>
  );
};

export default SignUpStep;
