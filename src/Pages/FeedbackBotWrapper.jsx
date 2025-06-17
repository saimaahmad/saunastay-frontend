// FeedbackBotWrapper.jsx
import React from 'react';
import FeedbackBotEN from './FeedbackBotEN';
import FeedbackBotFI from './FeedbackBotFI';
import { useTranslation } from 'react-i18next';

export default function FeedbackBotWrapper({ inline = false }) {
  const { i18n } = useTranslation();
  const Bot = i18n.language === 'fi' ? FeedbackBotFI : FeedbackBotEN;
  return <Bot inline={inline} />;      // 👈 pass the flag down
}
