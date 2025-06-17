import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const UserProfilePage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    contact: '',
    address: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        const ref = doc(db, 'users', user.email);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data());
          setImagePreview(snap.data().image || '');
        }
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, 'users', userEmail);
      await setDoc(ref, { ...profile, image: imagePreview, email: userEmail }, { merge: true });
      toast.success(t('profile.updateSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('profile.updateFail'));
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, userEmail);
      toast.success(t('profile.resetLinkSent'));
    } catch (err) {
      toast.error(t('profile.resetLinkFail'));
    }
  };

  return (
    <div className="bg-[#f5efe6] min-h-screen p-4 sm:p-6 font-serif">
      <h1 className="text-2xl font-bold text-[#243a26] mb-6">{t('profile.title')}</h1>

      <div className="bg-[#f3dcb9] rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
        {/* LEFT: Profile Summary */}
        <div className="md:w-1/3 text-center space-y-4">
          <img
            src={imagePreview || '/images/default-avatar.webp'}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#b67342]"
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          <p className="font-semibold text-[#243a26]">{profile.name || t('profile.name')}</p>
          <p className="text-sm text-gray-600">{userEmail}</p>
          <button
            onClick={handlePasswordReset}
            className="text-xs text-blue-700 underline hover:text-blue-900"
          >
            {t('profile.resetPassword')}
          </button>
        </div>

        {/* RIGHT: Editable Fields */}
        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: t('profile.name'), name: 'name', placeholder: t('profile.placeholder.name') },
            { label: t('profile.contact'), name: 'contact', placeholder: t('profile.placeholder.contact') },
            { label: t('profile.address'), name: 'address', placeholder: t('profile.placeholder.address') }
          ].map(field => (
            <div key={field.name} className="col-span-1">
              <label className="block text-sm font-semibold text-[#243a26] mb-1">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={profile[field.name] || ''}
                placeholder={field.placeholder}
                onChange={handleChange}
                className="w-full border bg-[#eee1ce] p-4 rounded text-[#243a26] border-gray-100"
              />
            </div>
          ))}

          <div className="col-span-2 text-right mt-4">
            <button
              onClick={handleSave}
              className="bg-[#b67342] hover:bg-[#a16234] text-white px-6 py-2 rounded"
            >
              {t('profile.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
