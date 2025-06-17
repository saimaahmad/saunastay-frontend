import React from 'react';
import { format } from 'date-fns';

const ReviewSection = ({ reviews }) => {
  if (!reviews.length) return <p className="text-gray-500">No reviews yet.</p>;

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <div key={index} className="bg-[#fdf5e9] p-4 rounded-lg shadow">
          {/* Line 1: Comment */}
          <p className="text-gray-800 mb-2">{review.comment}</p>

          {/* Line 2: Name + Date left, Rating right */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {review.customerName} •{' '}
              {review.createAt?.toDate
                ? format(review.createAt.toDate(), 'dd MMM yyyy')
                : 'Unknown date'}
            </span>
            <span className="text-yellow-500 font-medium">⭐ {review.rating}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewSection;
