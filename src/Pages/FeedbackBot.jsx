    import React, { useState } from 'react';
    import { db, auth } from '@/firebase';
    import { useAuthState } from 'react-firebase-hooks/auth';
    import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
    import i18n from '@/i18n/i18n'; // path to your i18n config
    import { useTranslation } from 'react-i18next';
  

    import { FaRegCommentDots } from 'react-icons/fa';
    import { toast } from 'react-toastify';

    export default function FeedbackBot() {
   const { t} = useTranslation();


    const [user] = useAuthState(auth);
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState(null);
    const [responses, setResponses] = useState({});
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    
    const handleResponse = (key, value) => {
        setResponses((prev) => ({ ...prev, [key]: value }));
    };

    const handleRoleSelection = (selectedRole) => {
        if (!user && (!guestName.trim() || !guestEmail.trim())) {
        toast.error(t('feedbackBot.requireGuestInfo'));
        return;
        }
        setRole(selectedRole);
    };

    const handleSubmit = async () => {
        if (!user && (!guestName.trim() || !guestEmail.trim())) {
        toast.error(t('feedbackBot.requireGuestInfo'));
        return;
        }
        
    if (!role) {
        toast.error(t('feedbackBot.requireRole'));
        return;
    }

    if (!responses.experience) {
        toast.error(t('feedbackBot.requireExperience'));
        return;
    }

    if (!responses.useAgain) {
        toast.error(t('feedbackBot.requireUseAgain'));
        return;
    }

    if (!responses.payForFeatures) {
        toast.error(t('feedbackBot.requirePayForFeatures'));
        return;
    }
        setSubmitting(true);
        await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || null,
        displayName: user?.displayName || guestName,
        email: user?.email || guestEmail,
        role,
        timestamp: serverTimestamp(),
        ...responses
        });
        setSubmitting(false);
        setIsOpen(false);
        setRole(null);
        setResponses({});
        setGuestName('');
        setGuestEmail('');
        toast.success(t('feedbackBot.success'));
    };

    return (
        <>
         
         <div key={i18n.language}>

        {!isOpen && (
            <button
            className="fixed bottom-5 right-5 bg-[#003580] text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 hover:bg-blue-800 transition"
            onClick={() => setIsOpen(true)}
            >
            <FaRegCommentDots size={18} />
            <span className="text-sm font-semibold">{t('feedbackBot.buttonLabel')}</span>
            </button>
        )}

        {isOpen && (
            <div className="fixed bottom-5 right-5 w-80 max-w-[95%] sm:max-w-full bg-[#fdf5e9] border border-gray-300 rounded-xl shadow-xl z-50">
            <div className="bg-[#003580] text-white font-semibold px-4 py-2 flex justify-between items-center">
                <span>{t('feedbackBot.title')}</span>
                 <div className="flex items-center gap-2">
    
    <button onClick={() => setIsOpen(false)} className="text-white text-sm">✕</button>
  </div>
               
            </div>
            <div className="p-4 text-sm space-y-4">
                            {!role ? (
                <>
                    {!user && (
                    <>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">{t('feedbackBot.name')}</label>
                        <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full border p-2 rounded text-sm mb-2"
                            required
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">{t('feedbackBot.email')}</label>
                        <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="w-full border p-2 rounded text-sm"
                            required
                        />
                        </div>
                    </>
                    )}
                    <p className="font-medium">{t('feedbackBot.rolePrompt')}</p>
                    <div className="flex gap-2">
                    <button onClick={() => handleRoleSelection('customer')} className="bg-[#003580] text-white px-3 py-1 rounded">
                        {t('feedbackBot.roles.customer')}
                    </button>
                    <button onClick={() => handleRoleSelection('owner')} className="bg-[#003580] text-white px-3 py-1 rounded">
                        {t('feedbackBot.roles.owner')}
                    </button>
                    </div>
                </>
                ) : (
                <>
                    <div>
                    <p className="font-medium">{t('feedbackBot.experience')}</p>
                    <div className="flex gap-2 mt-1">
                        {['😡', '😐', '🙂', '😍'].map((emoji, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleResponse('experience', emoji)}
                            className={`px-2 py-1 rounded border ${responses.experience === emoji ? 'bg-[#003580] text-white' : 'bg-white'}`}
                        >{emoji}</button>
                        ))}
                    </div>
                    </div>

                    <div>
                    <p className="font-medium">{t('feedbackBot.useAgain')}</p>
                    <div className="flex gap-2 mt-1">
                        {['Yes', 'No'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleResponse('useAgain', opt)}
                            className={`px-3 py-1 rounded border ${responses.useAgain === opt ? 'bg-[#003580] text-white' : 'bg-white'}`}
                        >{t(`feedbackBot.options.${opt.toLowerCase()}`)}</button>
                        ))}
                    </div>
                    </div>

                    <div>
                    <p className="font-medium">{t('feedbackBot.features')}</p>
                    <ul className="list-disc ml-4 text-xs text-gray-600">
                        <li>{t('feedbackBot.featuresList.360')}</li>
                        <li>{t('feedbackBot.featuresList.smart')}</li>
                        <li>{t('feedbackBot.featuresList.voice')}</li>
                        <li>{t('feedbackBot.featuresList.api')}</li>
                    </ul>

                    <div className="flex gap-2 mt-2">
                        {['Yes', 'No', 'Maybe'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleResponse('payForFeatures', opt)}
                            className={`px-3 py-1 rounded border ${responses.payForFeatures === opt ? 'bg-[#003580] text-white' : 'bg-white'}`}
                        >{t(`feedbackBot.options.${opt.toLowerCase()}`)}</button>
                        ))}
                    </div>
                    </div>

                    <div>
                    <p className="font-medium">{t('feedbackBot.suggestions')}</p>
                    <textarea
                        rows="2"
                        value={responses.suggestion || ''}
                        onChange={(e) => handleResponse('suggestion', e.target.value)}
                        className="w-full border p-2 rounded text-sm"
                        placeholder={t('feedbackBot.suggestionsPlaceholder')}
                    />
                    </div>

                    <button
                    onClick={handleSubmit}
                    className="mt-2 bg-[#003580] text-white w-full py-1 rounded"
                    disabled={submitting}
                    >
                    {submitting ? t('feedbackBot.submitting') : t('feedbackBot.submit')}
                    </button>
                </>
                )}
            </div>
            </div>
        )}
        </div>
        </>
    );
    }
