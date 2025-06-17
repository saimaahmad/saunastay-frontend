import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ALL_TYPES = ["Public", "Private", "Mobile"];
const ALL_CATEGORIES = [
  "Traditional Sauna", "Electric Sauna", "Wood Burning", "Outdoor Sauna",
  "Smoke Sauna", "Hybrid Sauna", "Barrel Sauna", "Infrared vs Traditional",
  "Popular Styles", "Steam Shower", "Bathroom Sauna", "Bio Sauna",
  "Cabin Sauna", "Steam Room"
];
const ALL_FEATURES = [
  "Wood-fired", "Cold plunge", "Changing room", "Outdoor",
  "WiFi", "Kitchen", "Parking", "Sauna light", "Pool", "Towels"
];

const CLOUD_NAME = 'dd7o8hpf2';
const UPLOAD_PRESET = 'saunastay_uploads';

const ManageSaunas = () => {
  const { t } = useTranslation();
  const [saunas, setSaunas] = useState([]);
  const [selectedSauna, setSelectedSauna] = useState(null);
  const [formData, setFormData] = useState({});
  const [ownerEmail, setOwnerEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setOwnerEmail(user.email);
    });
    return () => unsubscribe();
  }, []);

  const fetchSaunas = async () => {
    if (!ownerEmail) return;
    const snapshot = await getDocs(collection(db, "saunas"));
    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((sauna) => sauna.ownerEmail === ownerEmail);
    setSaunas(data);
    if (data.length > 0) {
      setSelectedSauna(data[0]);
      setFormData(data[0]);
    }
  };

  useEffect(() => {
    fetchSaunas();
  }, [ownerEmail]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...(prev.features || []), feature],
    }));
  };

  const handleImageChange = async (index, file) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (data.secure_url) {
        const updatedImages = [...(formData.images || [])];
        updatedImages[index] = data.secure_url;
        setFormData((prev) => ({ ...prev, images: updatedImages }));
        toast.success(t("manageSaunasOwner.imageUploaded"));
      }
    } catch (err) {
      toast.error(t("manageSaunasOwner.imageFailed"));
      console.error("Cloudinary upload error:", err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSauna) return;
    const docRef = doc(db, "saunas", selectedSauna.id);
    try {
      await updateDoc(docRef, formData);
      toast.success(t("manageSaunasOwner.updateSuccess"));
      setSaunas((prev) =>
        prev.map((s) => (s.id === selectedSauna.id ? { ...formData, id: s.id } : s))
      );
      setSelectedSauna({ ...formData, id: selectedSauna.id });
    } catch (err) {
      console.error("Error updating sauna:", err);
      toast.error(t("manageSaunasOwner.updateFail"));
    }
  };

  const handleDelete = async () => {
    if (!selectedSauna) return;
    if (confirm(t("manageSaunasOwner.deleteConfirm"))) {
      await deleteDoc(doc(db, "saunas", selectedSauna.id));
      toast.success(t("manageSaunasOwner.deleted"));
      setSaunas((prev) => prev.filter((s) => s.id !== selectedSauna.id));
      setSelectedSauna(null);
      setFormData({});
    }
  };

  return (
    <div className="bg-[#f5efe6] min-h-screen p-4 md:p-6">
      <ToastContainer />
      <h1 className="text-2xl font-serif mb-4 text-[#243a26]">{t("manageSaunasOwner.title")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="bg-[#f3dcb9] rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-serif mb-4">{t("manageSaunasOwner.yourSaunas")}</h2>
          <ul className="space-y-3">
            {saunas.map((s) => (
              <li
                key={s.id}
                onClick={() => {
                  setSelectedSauna(s);
                  setFormData(s);
                }}
                className={`cursor-pointer p-3 rounded border transition-all duration-200 ${
                  selectedSauna?.id === s.id
                    ? "bg-[#ebbd83] border-[#b67342] font-semibold shadow-md"
                    : "hover:bg-[#e5cdac] border-[#e4c497]"
                }`}
              >
                <div>{s.title}</div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{s.city}, {s.country}</span>
                  <span>{s.type}, {s.category}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link
            to="/host-sauna"
            className="mt-6 block text-center border-2 border-[#b67342] text-[#b67342] font-semibold py-2 rounded-md hover:bg-[#fae9d6]"
          >
            {t("manageSaunasOwner.addNew")}
          </Link>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 bg-[#f3dcb9] p-4 md:p-6 rounded-lg shadow-sm max-h-[90vh] overflow-y-auto">
          {selectedSauna ? (
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">{t("manageSaunasOwner.images")}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="relative">
                      <img
                        src={formData.images?.[i] || "/images/placeholder.jpg"}
                        className="h-28 md:h-32 w-full object-cover rounded border border-gray-300"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(i, e.target.files[0])}
                        className="mt-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder={t("manageSaunasOwner.title")}
                value={formData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="p-2 rounded border w-full bg-[#fdf5e9]"
              />

              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="p-2 rounded border w-full bg-[#fdf5e9]"
                >
                  <option value="">{t("manageSaunasOwner.selectType")}</option>
                  {ALL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="p-2 rounded border w-full bg-[#fdf5e9]"
                >
                  <option value="">{t("manageSaunasOwner.selectCategory")}</option>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <input
                  type="text"
                  placeholder={t("manageSaunasOwner.city")}
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="p-2 rounded border w-full bg-[#fdf5e9]"
                />
                <input
                  type="text"
                  placeholder={t("manageSaunasOwner.country")}
                  value={formData.country || ""}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="p-2 rounded border w-full bg-[#fdf5e9]"
                />
              </div>

              <input
                type="number"
                placeholder={t("manageSaunasOwner.price")}
                value={formData.price || ""}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className="p-2 rounded border w-full bg-[#fdf5e9]"
              />

              <div>
                <label className="block text-sm font-semibold mb-1">{t("manageSaunasOwner.duration")}</label>
                <div className="flex gap-4 mt-1">
                  {[30, 45, 60].map((duration) => (
                    <label key={duration} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="sessionDuration"
                        value={duration}
                        checked={formData.sessionDuration === duration}
                        onChange={(e) => handleInputChange("sessionDuration", parseInt(e.target.value))}
                        className="accent-[#4d603e]"
                      />
                      {duration} mins
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-1">{t("manageSaunasOwner.openingTime")}</label>
                  <input
                    type="time"
                    value={formData.openingTime || ''}
                    onChange={(e) => handleInputChange("openingTime", e.target.value)}
                    className="w-full p-2 rounded border bg-[#fdf5e9]"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-1">{t("manageSaunasOwner.closingTime")}</label>
                  <input
                    type="time"
                    value={formData.closingTime || ''}
                    onChange={(e) => handleInputChange("closingTime", e.target.value)}
                    className="w-full p-2 rounded border bg-[#fdf5e9]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-sm">{t("manageSaunasOwner.features")}</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ALL_FEATURES.map((feat) => (
                    <label key={feat} className="text-sm">
                      <input
                        type="checkbox"
                        checked={formData.features?.includes(feat)}
                        onChange={() => handleFeatureToggle(feat)}
                        className="mr-1"
                      />
                      {feat}
                    </label>
                  ))}
                </div>
              </div>

              <textarea
                placeholder={t("manageSaunasOwner.description")}
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full p-2 rounded border bg-[#fdf5e9]"
                rows={4}
              />

              <div className="flex flex-wrap gap-4 mt-4">
                <button
                  className="bg-[#4d603e] text-white px-6 py-2 rounded hover:bg-[#3a4f2e]"
                  onClick={handleUpdate}
                >
                  {t("manageSaunasOwner.update")}
                </button>
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                  onClick={handleDelete}
                >
                  {t("manageSaunasOwner.delete")}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">{t("manageSaunasOwner.noSaunaSelected")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSaunas;
