import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">{t("privacy.title")}</h1>

      <p className="mb-4">{t("privacy.intro")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t("privacy.collectTitle")}</h2>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>{t("privacy.item1")}</li>
        <li>{t("privacy.item2")}</li>
        <li>{t("privacy.item3")}</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t("privacy.whyTitle")}</h2>
      <p className="mb-4">{t("privacy.whyContent")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t("privacy.contactTitle")}</h2>
      <p>
        {t("privacy.contactText")}{' '}
        <a className="text-blue-600" href="mailto:thesaunastay@gmail.com">
          thesaunastay@gmail.com
        </a>
      </p>
    </div>
  );
}
