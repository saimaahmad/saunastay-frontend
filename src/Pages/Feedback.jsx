import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import FeedbackBotWrapper from './FeedbackBotWrapper';
import { useTranslation } from 'react-i18next';

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
  // Just forces a re-render when language changes
  setFeedbackList((prev) => [...prev]);
}, [i18n.language]);


  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbacks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbackList(feedbacks);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-[#003580]">{t('feed.feedbackPageTitle')}</h1>

      <div className="mb-8">
        <FeedbackBotWrapper inline />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">{t('name', 'Name')}</th>
              <th className="px-4 py-2">{t('Role', 'Role')}</th>
              <th className="px-4 py-2">{t('experience', 'Experience')}</th>
              <th className="px-4 py-2">{t('useAgain', 'Use again')}</th>
              <th className="px-4 py-2">{t('payForFeatures', 'Pay for features')}</th>
              <th className="px-4 py-2">{t('suggestion', 'Suggestion')}</th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.map((fb, index) => (
              <tr key={fb.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-2">{fb.displayName}</td>
                <td className="px-4 py-2">{t(`roleMap.${fb.role}`, fb.role)}</td>
                <td className="px-4 py-2">{t(`emojiMap.${fb.experience}`, fb.experience)}</td>
                <td className="px-4 py-2">{t(`useAgainMap.${fb.useAgain}`, fb.useAgain)}</td>
                <td className="px-4 py-2">{t(`payForFeaturesMap.${fb.payForFeatures}`, fb.payForFeatures)}</td>
                <td className="px-4 py-2">
                  {i18n.language === 'fi' ? fb.suggestion_fi : fb.suggestion_en}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
