import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const countries = [
  "Finland", "Sweden", "United States", "Canada", "United Kingdom", "Australia", "Germany", "France"
];

// Fix default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationStep = ({ formData, setFormData }) => {
  const { t } = useTranslation();
  const [markerPosition, setMarkerPosition] = useState([60.1695, 24.9354]);

  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setMarkerPosition([formData.latitude, formData.longitude]);
    }
  }, [formData.latitude, formData.longitude]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const address = data.address || {};

      setFormData((prev) => ({
        ...prev,
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        zip: address.postcode || '',
        country: address.country || '',
      }));
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        fetchAddressFromCoords(lat, lng);
      },
    });

    return (
      <Marker
        draggable
        position={markerPosition}
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            setMarkerPosition([lat, lng]);
            setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
            fetchAddressFromCoords(lat, lng);
          },
        }}
      />
    );
  };

  return (
    <div className="bg-[#eee1ce] min-h-screen py-4 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Country */}
        <div>
          <label className="block text-sm font-semibold text-[#243a26] mb-1">
            {t('location.country')}
          </label>
          <select
            name="country"
            value={formData.country || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-100 p-3 rounded bg-[#eee1ce]"
          >
            <option value="">{t('location.selectCountry')}</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-sm font-semibold text-[#243a26] mb-1">
            {t('location.address')}
          </label>
          <input
            type="text"
            placeholder={t('location.addressPlaceholder')}
            value={formData.address1 || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, address1: e.target.value }))}
            className="w-full border bg-[#eee1ce] p-4 rounded text-[#243a26] border-gray-100"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-[#243a26] mb-1">
            {t('location.city')}
          </label>
          <input
            type="text"
            placeholder={t('location.cityPlaceholder')}
            value={formData.city || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
            className="w-full border border-gray-100 bg-[#eee1ce] p-4 rounded text-[#243a26]"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-[#243a26] mb-1">
            {t('location.state')}
          </label>
          <input
            type="text"
            placeholder={t('location.statePlaceholder')}
            value={formData.state || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
            className="w-full border border-gray-100 bg-[#eee1ce] p-4 rounded text-[#243a26]"
          />
        </div>

        {/* ZIP */}
        <div>
          <label className="block text-sm font-semibold text-[#243a26] mb-1">
            {t('location.zip')}
          </label>
          <input
            type="text"
            placeholder={t('location.zipPlaceholder')}
            value={formData.zip || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value }))}
            className="w-full border border-gray-100 bg-[#eee1ce] p-4 rounded text-[#243a26]"
          />
        </div>

        {/* Map */}
        <div className="mt-10">
          <label className="block text-sm font-semibold text-[#243a26] mb-2">
            📍 {t('location.mapLabel')}
          </label>
          <MapContainer
            center={markerPosition}
            zoom={12}
            scrollWheelZoom={true}
              dragging={true}
  className="w-full h-[350px] sm:h-[400px] rounded border border-gray-300 z-0"
     
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
