import React from 'react';

const ImageGallery = ({ images = [] }) => {
  const [cover, ...rest] = images;

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4">
      {/* Top Row: Cover + Side 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cover Image (images[0]) */}
        <div className="md:col-span-2">
          <img
            src={cover || "/images/placeholder.jpg"}
            alt="Main"
            className="w-full h-[400px] object-cover rounded-xl shadow"
          />
        </div>

        {/* Side Image (images[1]) */}
        <div className="h-[400px]">
          <img
            src={images[1] || "/images/placeholder.jpg"}
            alt="Side 1"
            className="w-full h-full object-cover rounded-xl shadow"
          />
        </div>
      </div>

      {/* Bottom Row: images[2] & [3] */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <img
          src={images[2] || "/images/placeholder.jpg"}
          alt="Side 2"
          className="w-full h-[220px] object-cover rounded-xl shadow"
        />
        <img
          src={images[3] || "/images/placeholder.jpg"}
          alt="Side 3"
          className="w-full h-[220px] object-cover rounded-xl shadow"
        />
      </div>
    </div>
  );
};

export default ImageGallery;
