import React, { useEffect, useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';

const FavoriteButton = ({ saunaId, userId, variant = "overlay" }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!userId || !saunaId) return;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const favorites = userSnap.exists() ? userSnap.data().favorites || [] : [];
      setIsFavorited(favorites.includes(saunaId));
    };

    checkFavorite();
  }, [userId, saunaId]);

  const toggleFavorite = async () => {
    if (!userId || !saunaId) {
      toast.info("Please log in to save favorites");
      return;
    }

    const userRef = doc(db, 'users', userId);
    setLoading(true);

    try {
      await updateDoc(userRef, {
        favorites: isFavorited
          ? arrayRemove(saunaId)
          : arrayUnion(saunaId),
      });

      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? "Removed from favorites" : "Added to favorites ❤️");
    } catch (err) {
      toast.error("Failed to update favorites");
      console.error(err);
    }

    setLoading(false);
  };

  const overlayStyle = variant === "overlay"
    ? "absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 p-[2px] text-base rounded-full"
    : "text-xl text-right";

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={overlayStyle}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  );
};


 
export default FavoriteButton;
