import React from 'react';
import { useTranslation } from 'react-i18next';

const SaunaJournal = () => {
  const { t } = useTranslation();
  const articles = t('journal.articles', { returnObjects: true });

  return (
    <div className="bg-[#f5efe6] min-h-screen px-4 sm:px-6 py-10 font-serif text-[#243a26]">
      <h1 className="text-3xl sm:text-5xl font-serif text-center mb-6">
        {t('journal.title')}
      </h1>
      <p className="text-center text-gray-700 text-base sm:text-lg mb-10 sm:mb-12 max-w-2xl mx-auto">
        {t('journal.subtitle')}
      </p>

      <div className="space-y-16 max-w-6xl mx-auto">
        {articles.map((article, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center gap-8 ${
              index % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <img
              src={`/images/article-${index + 1}.jpg`}
              alt={article.title}
              className="w-full md:w-1/2 h-64 object-cover rounded-lg shadow-lg"
            />
            <div className="md:w-1/2">
              <h2 className="text-xl sm:text-2xl font-bold mb-3">{article.title}</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {article.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaunaJournal;
