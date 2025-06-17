
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react'; // ✅ FIXED




const StepLayout = ({ title, description, children, onNext, onBack , nextLabel, disableNext}) => {


  
  return (
    <div className="bg-[#eee1ce] min-h-screen flex flex-col justify-between">
      {/* Page Content */}
      <div className="px-6 py-10 max-w-5xl w-full mx-auto">
        <h2 className="text-3xl font-serif text-[#243a26] mb-2">{title}</h2>
        {description && <p className="text-gray-700 text-lg mb-8">{description}</p>}
        {children}
      </div>

      {/* Sticky Footer: Full Width */}
      <div className="w-full fixed bottom-0 left-0 z-50 bg-[#eee1ce] border-t border-gray-200">
        <div className="flex justify-between items-center max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="text-[#243a26] underline text-sm font-medium"
          >
            Back
          </button>
          

          <button
  onClick={onNext}
  disabled={disableNext}
  className={`px-6 py-2 rounded text-sm font-semibold ${
    disableNext
      ? 'bg-gray-400 cursor-not-allowed text-white'
      : 'bg-[#4d603e] hover:bg-[#3a4f2e] text-white'
  }`}
  
>
  {nextLabel || 'Next'}
</button>

        </div>
      </div>
    </div>
  );
};

export default StepLayout;
