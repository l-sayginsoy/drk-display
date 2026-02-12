import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/display');
    }, 10000); // 10 seconds

    // Cleanup function to clear the timeout if the component unmounts
    // or if the user navigates away manually by clicking a button.
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-12">
            <img src="assets/drk-logo.png" alt="DRK Logo" className="h-20"/>
            <h1 className="text-5xl font-bold text-gray-800">DRK Melm Dashboard</h1>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/display')}
            className="px-10 py-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors text-xl"
          >
            Zur Anzeige
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-10 py-4 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors text-xl"
          >
            Zum Admin-Bereich
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;