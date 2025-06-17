// src/pages/AddNewSauna.jsx
import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaShuttleVan } from 'react-icons/fa';
import StepController from '../components/StepController';
import { useTranslation } from 'react-i18next';



const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dd7o8hpf2/image/upload';
const UPLOAD_PRESET = 'unsigned_sauna';



const AddNewSauna = () => {
    const { t } = useTranslation();
    
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
    type: '',
    contactEmail: '',
    saunaAddress: '',
    hostName: ''
  });
  const [category, setCategory] = useState('');
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState([]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFeature = (feature) => {
    setFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files].slice(0, 3));
  };

  const uploadImages = async (files) => {
    const urls = [];
    for (const file of files) {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: form });
      const data = await res.json();
      urls.push(data.secure_url);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uploadedImages = await uploadImages(images);
      const saunaId = formData.title.toLowerCase().replace(/\s+/g, '-');

      await setDoc(doc(db, 'saunas', saunaId), {
        title: formData.title,
        description: formData.description,
        totalSpots: 6,
        location: formData.location,
        price: Number(formData.price),
        Ratings: 0,
        reviews: [],
        Type: formData.type,
        Category: category,
        features,
        images: uploadedImages,
        contactEmail: formData.contactEmail,
        saunaAddress: formData.saunaAddress,
        host: {
          name: formData.hostName || auth.currentUser?.displayName || 'Anonymous',
          avatar: `https://source.unsplash.com/featured/?person,${Math.floor(Math.random() * 1000)}`
        },
        ownerId: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp()
      });

      navigate(`/owner/dashboard/availability/${saunaId}`);
    } catch (error) {
      console.error('Error adding sauna:', error);
      alert('Failed to add sauna.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
      
  
<div className="bg-[#eee1ce] min-h-screen font-sans text-[#243a26]">
  {/* Hero Section */}
  <section
    className="relative bg-cover bg-center h-[300px] mb-4 flex flex-col justify-center items-center text-center text-black"
    style={{ backgroundImage: "url('/images/AddNewSauna-Cover.png')" }}
  >
  
  </section>
  <div className="z-10 px-4 items-center text-center text-black ">
        <h1 className="text-5xl font-serif mb-2 tracking-tight drop-shadow-md">🌿 {t('listYourSauna')}</h1>
      <p className="text-lg opacity-90"> {t('listYourSaunaSubtitle')}</p>
    </div>
  {/* Steps */}
  <div className="max-w-4xl mx-auto px-4 pb-20">
    <StepController />
  </div>
</div>

);

}
export default AddNewSauna;
