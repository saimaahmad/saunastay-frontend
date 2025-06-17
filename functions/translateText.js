// functions/translateText.js (Firebase Functions backend)
import { onCall } from 'firebase-functions/v2/https';
import { TranslateServiceClient } from '@google-cloud/translate';

const translateClient = new TranslateServiceClient();

export const translateText = onCall(async (req) => {
  const { text, sourceLang = 'en', targetLang = 'fi' } = req.data;
  if (!text) throw new Error('Missing text');

  const [response] = await translateClient.translateText({
    parent: `projects/${process.env.GCLOUD_PROJECT}/locations/global`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode: sourceLang,
    targetLanguageCode: targetLang,
  });

  return {
    translatedText: response.translations?.[0]?.translatedText || '',
  };
});
