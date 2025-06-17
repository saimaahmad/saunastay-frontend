import React, { useState } from 'react';
import SaunaTypeStep from './SaunaTypeStep';
import SaunaCategoryStep from './SaunaCategoryStep';
import SignUpStep from './SignUpStep';
import LoginStep from './LoginStep';
import SaunaInfoStep from './SaunaInfoStep';
import SaunaTimingStep from './SaunaTimingStep'; // 🆕 New Step
import LocationStep from './LocationStep';
import ImageUploadStep from './ImageUploadStep';
import StepLayout from './StepLayout';
import AmenitiesStep from './AmenitiesStep';
import SecurityFeaturesStep from './SecurityFeaturesStep';
import { auth } from '../firebase';
import { doc, setDoc, serverTimestamp , getDoc} from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import tzlookup from 'tz-lookup'; // ⬅️ add this import at the top
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase'; // your configured firebase client

const StepController = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    title: '',
    description: '',
    hostName: '',
    avatar: '',
    totalSpots: '',
    country: '',
    address1: '',
    city: '',
    state: '',
    zip: '',
    amenities: [],
    images: [],
    securityNote: '',
    openingTime: '',          // 🆕 added
    closingTime: '',          // 🆕 added
    sessionDuration: 60 ,      // 🆕 default 1 hour
    price: '',
     // ✅ Added map fields for LocationStep
  latitude: 60.1699,       // default to Helsinki
  longitude: 24.9384,
   timezone: '',
  });
  const [submitting, setSubmitting] = useState(false);

const { t } = useTranslation();
const [skippedSteps, setSkippedSteps] = useState([]);
const { i18n } = useTranslation();
  const nextStep = () => setStep((prev) => prev + 1);
const prevStep = () => {
  if (step === 5) {
    setStep(2); // 👈 go back to Step 2 directly from Step 5
  } else {
    setStep((prev) => Math.max(1, prev - 1)); // 👈 normal back behavior
  }
};

 





  const updateData = (newData) => setFormData((prev) => ({ ...prev, ...newData }));
    const handleSaunaInfoNext = () => {
    if (!formData.title || !formData.hostName || !formData.description || !formData.totalSpots) {
toast.error(t('toast.fillSaunaInfo'));
      return;
    }
    nextStep();
  };

const handleSaunaTimingNext = () => {
  const { openingTime, closingTime, sessionDuration, price } = formData;

  if (!openingTime || !closingTime || !sessionDuration || !price) {
  toast.error(t('toast.fillTiming'));
    return;
  }

  nextStep();
};




const handleSaunaLocationNext = () => {
  const { country, address1, city, state, zip, latitude, longitude } = formData;

  if (!country || !address1 || !city || !state || !zip) {
   toast.error(t('toast.fillLocation'));
    return;
  }

  try {
    // 🌍 Auto-detect timezone based on coordinates
    const timezone = tzlookup(latitude, longitude); // e.g., "Europe/Copenhagen"
    updateData({ timezone }); // ⬅️ Save timezone to formData

    nextStep();
  } catch (err) {
toast.error(t('toast.timezoneError'));
    console.error('Timezone lookup failed:', err);
  }
};


  const handleImageUploadNext = () => {
    if (!formData.images || !formData.images[0] || !formData.images[1] || !formData.images[2]|| !formData.images[3]) {
toast.error(t('toast.uploadImages'));
      return;
    }
    nextStep();
  };

  const handleAmenitiesNext = () => {
    if (!formData.amenities || formData.amenities.length === 0) {
toast.error(t('toast.selectAmenities'));
      return;
    }
    nextStep();
  };

  const handleSecurityStepNext = () => {
  const { hasCamera, hasNoiseMonitor, hasWeapons, securityNote } = formData;

  if (!hasCamera && !hasNoiseMonitor && !hasWeapons && !securityNote) {
  toast.error(t('toast.securityInfo'));
    return;
  }

  submitToFirestore();
};

const navigate = useNavigate();

// ✅ Skip login/signup if user already logged in


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user || (step !== 3 && step !== 4)) return;

    try {
      const userSnap = await getDoc(doc(db, 'users', user.email.toLowerCase()));
      if (!userSnap.exists()) {
        console.warn('User doc not found');
        return;
      }

      const userData = userSnap.data();
      const role = userData.roles || userData.role || 'user';

      if (role === 'owner') {
        setSkippedSteps([3, 4]); // Mark login/signup as skipped
        setStep(5); // Skip to SaunaInfoStep
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  });

  return () => unsubscribe();
}, [step]);


  const submitToFirestore = async () => {
  const user = auth.currentUser;
  if (!user) return toast.error(t('toast.authError'));

  const docId = `${user.email}_${formData.title?.replace(/\s+/g, '_')}`;
  const translateSuggestionLocally = async (text, targetLang) => {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0]?.[0]?.[0] || '';
  };

  const translateField = async (fieldValue) => {
    const text = fieldValue?.trim() || '';
    if (!text) return { en: '', fi: '' };
    return {
      en: i18n.language === 'fi' ? await translateSuggestionLocally(text, 'en') : text,
      fi: i18n.language === 'en' ? await translateSuggestionLocally(text, 'fi') : text,
    };
  };

  setSubmitting(true);

  // Translate relevant fields
  const { description, city, country, securityNote } = formData;

  const descriptionTranslated = await translateField(description);
  const cityTranslated = await translateField(city);
  const countryTranslated = await translateField(country);
  const securityNoteTranslated = await translateField(securityNote);

  const finalData = {
    ...formData,
    avatar: formData.avatar || '/images/default-avatar.webp',
    ownerEmail: user.email,
    createdAt: serverTimestamp(),
    description_en: descriptionTranslated.en,
    description_fi: descriptionTranslated.fi,
    city_en: cityTranslated.en,
    city_fi: cityTranslated.fi,
    country_en: countryTranslated.en,
    country_fi: countryTranslated.fi,
    securityNote_en: securityNoteTranslated.en,
    securityNote_fi: securityNoteTranslated.fi,
  };

  try {
    await setDoc(doc(db, 'saunas', docId), finalData);
    toast.success(t('toast.listingSuccess'));
    setTimeout(() => {
      navigate('/owner/home');
    }, 1500);
  } catch (error) {
    console.error('Error submitting sauna listing:', error);
    toast.error(t('toast.listingError'));
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="bg-[#eee1ce] min-h-screen">

      {step === 1 && (
        <StepLayout
       title={t('selectSaunaType')}
  description={t('selectSaunaTypeDescription')}
          onNext={nextStep}
          disableNext={!formData.type}
        >
          <SaunaTypeStep
            selectedType={formData.type}
            onSelectType={(type) => updateData({ type })}
            goToNextStep={nextStep}
          />
        </StepLayout>
      )}

      {step === 2 && (
        <StepLayout
       title={t('chooseCategory')}
  description={t('chooseCategoryDescription')}
          onNext={nextStep}
          onBack={prevStep}
          disableNext={!formData.category}
        >
          <SaunaCategoryStep
            selectedCategory={formData.category}
            setSelectedCategory={(category) => updateData({ category })}
            goToNextStep={nextStep}
            onBack={prevStep}
          />
        </StepLayout>
      )}

      {step === 3 && (
        <LoginStep
          goToSignup={() => setStep(4)}
          onLoginSuccess={() => setStep(5)}
        />
      )}

      {step === 4 && (
        <SignUpStep onSignupSuccess={() => setStep(5)} />
      )}

      {step === 5 && (
        <StepLayout
       title={t('enterSaunaInfo')}
    description={t('enterSaunaInfoDescription')}
          onNext={handleSaunaInfoNext}
          onBack={prevStep}
        >
          <SaunaInfoStep
            formData={formData}
            setFormData={setFormData}
            onSave={updateData}
            onNext={nextStep}
          />
        </StepLayout>
      )}

      {/* 🆕 Step 6 - Sauna Timing */}
      {step === 6 && (
        <StepLayout
         title={t('setSaunaHours')}
    description={t('setSaunaHoursDescription')}
          onNext={handleSaunaTimingNext}
  onBack={prevStep}
        >
          <SaunaTimingStep
            formData={formData}
            setFormData={setFormData}
            onNext={nextStep}
          />
        </StepLayout>
      )}

      {step === 7 && (
        <StepLayout
          title={t('locationTitle')}
    description={t('locationDescription')}
          onNext={handleSaunaLocationNext}
          onBack={prevStep}
        >
          <LocationStep
            formData={formData}
            setFormData={setFormData}
            onSave={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        </StepLayout>
      )}

      {step === 8 && (
        <StepLayout
            title={t('addPhotos')}
    description={t('addPhotosDescription')}
          onNext={handleImageUploadNext}
          onBack={prevStep}
        >
          <ImageUploadStep
            formData={formData}
            setFormData={setFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        </StepLayout>
      )}

      {step === 9 && (
        <StepLayout
          title={t('chooseAmenities')}
    description={t('chooseAmenitiesDescription')}
          onNext={handleAmenitiesNext}
          onBack={prevStep}
        >
          <AmenitiesStep
            formData={formData}
            setFormData={setFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        </StepLayout>
      )}

      {step === 10 && (
     <StepLayout
 title={t('securityTitle')}
    description={t('securityDescription')}
  onNext={handleSecurityStepNext}
  onBack={prevStep}
  nextLabel="Create Listing"
>

          <SecurityFeaturesStep
            formData={formData}
            setFormData={setFormData}
          />
        </StepLayout>
      )}
    </div>
  );
};

export default StepController;
