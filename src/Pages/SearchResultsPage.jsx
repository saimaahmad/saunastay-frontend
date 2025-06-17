// src/pages/SearchResultsPage.jsx

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SaunaCard from '../components/SaunaCard';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [saunas, setSaunas] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceSort, setPriceSort] = useState('');

  const locationParam = searchParams.get('location')?.toLowerCase();
  const typeParam = searchParams.get('type')?.toLowerCase();

  useEffect(() => {
    const fetchSaunas = async () => {
      const saunaSnapshot = await getDocs(collection(db, 'saunas'));
      const saunaList = saunaSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSaunas(saunaList);
    };
    fetchSaunas();
  }, []);

  useEffect(() => {
    let filteredList = saunas;

    if (locationParam) {
      filteredList = filteredList.filter(sauna =>
        sauna.location?.toLowerCase().includes(locationParam)
      );
    }

    if (typeParam) {
      filteredList = filteredList.filter(sauna =>
        sauna.Type?.toLowerCase() === typeParam
      );
    }

    if (selectedCategory) {
      filteredList = filteredList.filter(
        sauna => sauna.Category === selectedCategory
      );
    }

    if (priceSort === 'low') {
      filteredList = [...filteredList].sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high') {
      filteredList = [...filteredList].sort((a, b) => b.price - a.price);
    }

    setFiltered(filteredList);
  }, [saunas, locationParam, typeParam, selectedCategory, priceSort]);

  return (
    <div className="bg-[#f5efe6] min-h-screen text-[#243a26] font-sans px-4 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Sidebar Filters */}
        <div className="md:col-span-1 space-y-6 bg-[#e1d5c9] p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2">Filter Results</h3>

          <div>
            <label className="font-medium text-sm block mb-1">Category</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              <option value="">All</option>
              <option value="Smoke Sauna">Smoke Sauna</option>
              <option value="Outdoor Sauna">Outdoor Sauna</option>
              <option value="Hybrid Sauna">Hybrid Sauna</option>
              <option value="Steam Room">Steam Room</option>
              <option value="Barrel Sauna">Barrel Sauna</option>
              {/* Add more as needed */}
            </select>
          </div>

          <div>
            <label className="font-medium text-sm block mb-1">Sort by Price</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => setPriceSort(e.target.value)}
              value={priceSort}
            >
              <option value="">None</option>
              <option value="low">Low to High</option>
              <option value="high">High to Low</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-3xl font-bold">
            Showing Results for:{" "}
            <span className="text-[#b67342]">
              {locationParam || 'All Locations'}
            </span>{" "}
            {typeParam && `· ${typeParam}`}
          </h2>

          {filtered.length === 0 ? (
            <p className="text-gray-500 mt-8">No saunas found matching your search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((sauna) => (
                <SaunaCard key={sauna.id} sauna={sauna} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
