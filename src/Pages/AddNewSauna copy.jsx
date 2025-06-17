// src/pages/AddNewSauna.jsx
import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import SetAvailability from '../components/SetAvailability';
import { FaHome, FaUsers, FaShuttleVan } from 'react-icons/fa';
import StepController from '../components/StepController';




const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dd7o8hpf2/image/upload';
const UPLOAD_PRESET = 'unsigned_sauna';



const AddNewSauna = () => {
  
    
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
        className="relative bg-cover bg-center h-[300px] mb-4 "
        style={{ backgroundImage: "url('/images/AddNewSauna-Cover.png')" }}
      >
     
        

      </section>
      


      <div className="relative z-10 h-full flex flex-col justify-center items-center text-black text-center px-4">
          <h1 className="text-5xl font-serif mb-2 tracking-tight drop-shadow-md">
          🌿 List Your Sauna
          </h1>
          <p className="text-lg opacity-90  mb-2" >Share your tranquil space with guests seeking a unique sauna experience.</p>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
        <StepController />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#eee1ce]">
       
        <form onSubmit={handleSubmit} className="space-y-4 text-[#243a26]">
  <div>
    <label className="block text-sm font-medium">Title</label>
    <input name="title" placeholder="Title" className="w-full border p-2 rounded" onChange={handleChange} required />
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium">Price (€)</label>
      <input name="price" type="number" className="w-full border p-2 rounded" onChange={handleChange} required />
    </div>
    <div>
    </div>
    <div className="mb-6">
  <label className="block text-sm font-medium mb-2">Select Sauna Type</label>
  
  <div className="flex justify-between gap-4 flex-wrap overflow-x-auto">

    {[
      { label: 'Private', icon: <FaHome size={24} /> },
      { label: 'Public', icon: <FaUsers size={24} /> },
      { label: 'Mobile', icon: <FaShuttleVan size={24} /> },
    ].map(({ label, icon }) => (
      <button
        key={label}
        type="button"
        className={`flex flex-col items-center justify-center basis-1/3  min-w-[120px] h-32 rounded-lg border transition shadow-md px-4 py-3 text-sm font-semibold gap-2
          ${formData.type === label
            ? 'bg-[#b67342] text-white border-[#b67342]'
            : 'bg-white text-[#243a26] border-gray-300 hover:border-[#b67342]'}`}
        onClick={() => setFormData(prev => ({ ...prev, type: label }))}
      >
        <div className="text-2xl">{icon}</div>
        <span>{label}</span>
      </button>
    ))}
  </div>
</div>


        
    </div>
  

  <div>
    <label className="block text-sm font-medium">Category</label>
    <select name="category" className="w-full border p-2 rounded" onChange={handleChange} required>
      <option value="">Select Category</option>
      <option value="Traditional Sauna">Traditional Sauna</option>
      <option value="Electric Sauna">Electric Sauna</option>
      <option value="Wood burning sauna">Wood burning sauna</option>
      <option value="Outdoor Sauna">Outdoor Sauna</option>
      <option value="Smoke Sauna">Smoke Sauna</option>
      <option value="Hybrid Sauna">Hybrid Sauna</option>
      <option value="Barrel Sauna">Barrel Sauna</option>
      <option value="Infrared Sauna">Infrared Sauna</option>
      <option value="Steam Room">Steam Room</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium">Location</label>
    <input name="location" placeholder="City, Country" className="w-full border p-2 rounded" onChange={handleChange} required />
  </div>

  <div>
    <label className="block text-sm font-medium">Detailed Sauna Address</label>
    <input name="saunaAddress" placeholder="Exact Address" className="w-full border p-2 rounded" onChange={handleChange} required />
  </div>

  <div>
    <label className="block text-sm font-medium">Description</label>
    <textarea name="description" rows={3} className="w-full border p-2 rounded" onChange={handleChange} required />
  </div>

  <div>
    <label className="block text-sm font-medium">Owner Name</label>
    <input name="hostName" placeholder="Owner Full Name" className="w-full border p-2 rounded" onChange={handleChange} required />
  </div>

  <div>
    <label className="block text-sm font-medium">Contact Email</label>
    <input name="contactEmail" type="email" placeholder="example@domain.com" className="w-full border p-2 rounded" onChange={handleChange} required />
  </div>
  <div>
  <p className="text-sm font-medium text-[#243a26] mb-1">Features</p>
  <div className="flex flex-wrap gap-4">
    {[
      { icon: '🔥', label: 'wood-fired' },
      { icon: '❄️', label: 'cold plunge' },
      { icon: '🚿', label: 'changing room' },
      { icon: '🌲', label: 'outdoor' },
      { icon: '📶', label: 'wifi' },
      { icon: '🍳', label: 'kitchen' },
      { icon: '🚗', label: 'parking' },
      { icon: '💡', label: 'sauna light' },
      { icon: '🏊', label: 'pool' },
      { icon: '🧖‍♀️', label: 'towels' }
    ].map((feature) => (
      <label
        key={feature.label}
        className="flex items-center gap-2 text-sm text-gray-700 bg-[#eee1ce] px-3 py-1 rounded shadow-sm"
      >
        <input
          type="checkbox"
          value={feature.label}
          checked={features.includes(feature.label)}
          onChange={() => toggleFeature(feature.label)}
        />
        <span>{feature.icon}</span>
        <span className="capitalize">{feature.label}</span>
      </label>
    ))}
  </div>
</div>

 


            <div>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full border p-2 rounded" />
              <p className="text-xs text-gray-500">Upload up to 3 images</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">📅 Set Availability</h3>
              <SetAvailability embedded={true} availability={availability} setAvailability={setAvailability} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#4d603e] hover:bg-[#3c4f30] text-white font-bold py-2 px-4 rounded">
              {loading ? 'Submitting...' : 'Add Sauna'}
            </button>
          </form>
        </div>
      </div>
    </div>

);

}
export default AddNewSauna;
