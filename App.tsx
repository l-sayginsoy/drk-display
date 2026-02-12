
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import LandingPage from './pages/LandingPage';
import { AppData } from './types';
import { initialData } from './data/mockData';

function loadState(): AppData {
  try {
    const storedData = localStorage.getItem('drkMelmData');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      // Safely merge parsed data with initial data to prevent crashes from malformed storage
      return {
        urgentMessage: { ...initialData.urgentMessage, ...(parsed.urgentMessage || {}) },
        meals: Array.isArray(parsed.meals) ? parsed.meals : initialData.meals,
        slideshow: {
          ...initialData.slideshow,
          ...(parsed.slideshow || {}),
          images: (parsed.slideshow && Array.isArray(parsed.slideshow.images))
            ? parsed.slideshow.images
            : initialData.slideshow.images,
        },
        weeklySchedule: parsed.weeklySchedule || initialData.weeklySchedule,
        quotes: Array.isArray(parsed.quotes) ? parsed.quotes : initialData.quotes,
        locations: Array.isArray(parsed.locations) ? parsed.locations : initialData.locations,
      };
    }
  } catch (error) {
    console.error("Could not parse localStorage data, using initial data.", error);
  }
  return initialData;
}


function App() {
  const [appData, setAppData] = useState<AppData>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem('drkMelmData', JSON.stringify(appData));
    } catch (error) {
      console.error("Could not save data to localStorage.", error);
    }
  }, [appData]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/display" element={<Dashboard appData={appData} />} />
          <Route path="/admin" element={<AdminPanel appData={appData} setAppData={setAppData} />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;