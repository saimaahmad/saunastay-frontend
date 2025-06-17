// FeedbackBotFI.jsx
import React, { useState } from 'react';
import { db, auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FaRegCommentDots } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export default function FeedbackBotFI({ inline = false }) {
  const [user] = useAuthState(auth);
 const [isOpen, setIsOpen] = useState(inline);
  const [role, setRole] = useState(null);
  const [responses, setResponses] = useState({});
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
const { i18n } = useTranslation();
  const handleResponse = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleRoleSelection = (selectedRole) => {
    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Anna nimesi ja sähköpostiosoitteesi jatkaaksesi.');
      return;
    }
    setRole(selectedRole);
  };

  const handleSubmit = async () => {
    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Anna nimesi ja sähköpostiosoitteesi jatkaaksesi.');
      return;
    }
    if (!role) return toast.error('Valitse roolisi.');
    if (!responses.experience) return toast.error('Arvioi kokemuksesi.');
    if (!responses.useAgain) return toast.error('Vastaa, käyttäisitkö SaunaStayta uudelleen.');
    if (!responses.payForFeatures) return toast.error('Vastaa maksullisista ominaisuuksista.');


    const translateSuggestionLocally = async (text, targetLang) => {
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
  const data = await res.json();
  return data[0]?.[0]?.[0] || '';
};


    setSubmitting(true);
      const suggestion = responses.suggestion?.trim() || '';
  let suggestion_en = '';
  let suggestion_fi = '';

  if (suggestion) {
    suggestion_en = i18n.language === 'fi'
      ? await translateSuggestionLocally(suggestion, 'en')
      : suggestion;
    suggestion_fi = i18n.language === 'en'
      ? await translateSuggestionLocally(suggestion, 'fi')
      : suggestion;
  }

    await addDoc(collection(db, 'feedback'), {
      userId: user?.uid || null,
      displayName: user?.displayName || guestName,
      email: user?.email || guestEmail,
      role,
      timestamp: serverTimestamp(),
      ...responses,
       suggestion_en,
  suggestion_fi, // ✅ include both
    });
    setSubmitting(false);
    setIsOpen(false);
    setRole(null);
    setResponses({});
    setGuestName('');
    setGuestEmail('');
    toast.success('Kiitos palautteestasi!');
  };

  return (
    <div key="fi">
       {/* floating button only if not inline */}
      {!inline && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 bg-[#003580] text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 hover:bg-blue-800 transition"
        >
          <FaRegCommentDots size={18} />
          <span className="text-sm font-semibold">Anna palautetta</span>
        </button>
      )}

      {isOpen && (
        <div
          className={
            inline
              ? 'w-full max-w-xl mx-auto bg-[#fdf5e9] border border-gray-300 rounded-xl shadow p-4 mb-8'
              : 'fixed bottom-5 right-5 w-80 max-w-[95%] sm:max-w-full bg-[#fdf5e9] border border-gray-300 rounded-xl shadow-xl z-50'
          }
        >
          <div className="bg-[#003580] text-white font-semibold px-4 py-2 flex justify-between items-center">
            <span>Arvostamme palautettasi</span>
           {!inline && (
              <button onClick={() => setIsOpen(false)} className="text-white text-sm">✕</button>
            )}
          </div>

          <div className="p-4 text-sm space-y-4">
            {!role ? (
              <>
                {!user && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nimesi (pakollinen)</label>
                      <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full border p-2 rounded text-sm mb-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sähköpostisi (pakollinen)</label>
                      <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full border p-2 rounded text-sm" />
                    </div>
                  </>
                )}
                <p className="font-medium">Oletko asiakas vai saunan omistaja?</p>
                <div className="flex gap-2">
                  <button onClick={() => handleRoleSelection('customer')} className="bg-[#003580] text-white px-3 py-1 rounded">Asiakas</button>
                  <button onClick={() => handleRoleSelection('owner')} className="bg-[#003580] text-white px-3 py-1 rounded">Omistaja</button>
                </div>
              </>
            ) : (
              <>
                <p className="font-medium">Miten kokemuksesi SaunaStayn kanssa sujui?</p>
                <div className="flex gap-2 mt-1">
                  {['😡', '😐', '🙂', '😍'].map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleResponse('experience', emoji)}
                      className={`px-2 py-1 rounded border ${responses.experience === emoji ? 'bg-[#003580] text-white' : 'bg-white'}`}
                    >{emoji}</button>
                  ))}
                </div>

                <p className="font-medium">Käyttäisitkö SaunaStayta uudelleen?</p>
                <div className="flex gap-2 mt-1">
                  {['Kyllä', 'Ei'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleResponse('useAgain', opt)}
                      className={`px-3 py-1 rounded border ${responses.useAgain === opt ? 'bg-[#003580] text-white' : 'bg-white'}`}
                    >{opt}</button>
                  ))}
                </div>

                <p className="font-medium">Maksaisitko lisäominaisuuksista, kuten:</p>
                <ul className="list-disc ml-4 text-xs text-gray-600">
                  <li>360° saunanäkymä</li>
                  <li>Älykkäät ohjaimet</li>
                  <li>Äänikomento</li>
                  <li>API-synkronointi varausjärjestelmän kanssa</li>
                </ul>
                <div className="flex gap-2 mt-2">
                  {['Kyllä', 'Ei', 'Ehkä'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleResponse('payForFeatures', opt)}
                      className={`px-3 py-1 rounded border ${responses.payForFeatures === opt ? 'bg-[#003580] text-white' : 'bg-white'}`}
                    >{opt}</button>
                  ))}
                </div>

                <p className="font-medium">Onko sinulla ehdotuksia SaunaStayn parantamiseksi?</p>
                <textarea
                  rows="2"
                  value={responses.suggestion || ''}
                  onChange={(e) => handleResponse('suggestion', e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Kirjoita ehdotuksesi tähän."
                />

                <button
                  onClick={handleSubmit}
                  className="mt-2 bg-[#003580] text-white w-full py-1 rounded"
                  disabled={submitting}
                >
                  {submitting ? 'Lähetetään...' : 'Lähetä'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
