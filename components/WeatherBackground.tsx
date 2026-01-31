
import React, { useState, useEffect, useMemo } from 'react';

/**
 * WEATHER BACKGROUND KOMPONENTE - VERSION 5.1 (Environmental Engine)
 * - Multiply Blending: Verwendet Layer-Technik zur Licht-Extraktion aus dem Bild.
 * - Highlight Crushing: Drückt Kontraste bei Bewölkung flach (gegen blendende Wolken).
 * - Flat-Light Logic: Wettercode steuert Helligkeit stärker als die Uhrzeit.
 */
const WeatherBackground: React.FC<{ code: number | undefined; isDay: boolean }> = ({ code, isDay }) => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [nextImage, setNextImage] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeCode = code ?? -1; 

  const targetImage = useMemo(() => {
    if (activeCode === -1) return '';

    // SONNE (0)
    if (activeCode === 0) 
      return isDay 
        ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=2400&auto=format&fit=crop';
    
    // BEWÖLKT (1-3) - Diffuses Licht ohne harte Schatten
    if (activeCode >= 1 && activeCode <= 3)
      return isDay
        ? 'https://images.unsplash.com/photo-1445262102387-5fbb30a5e59d?q=80&w=2400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=2400&auto=format&fit=crop';

    // REGEN / NEBEL
    if ((activeCode >= 45 && activeCode <= 67) || (activeCode >= 80 && activeCode <= 82))
      return 'https://images.unsplash.com/photo-1428592953211-077101b2021b?q=80&w=2400&auto=format&fit=crop';
    
    // SCHNEE
    return 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=2400&auto=format&fit=crop';
  }, [activeCode, isDay]);

  const envConfig = useMemo(() => {
    const isCloudy = activeCode >= 1 && activeCode <= 82;
    const isStormy = activeCode >= 95;

    let multiplyColor = 'transparent';
    let multiplyOpacity = 0;
    let saturation = isDay ? 1.0 : 0.4;
    let brightness = isDay ? 1.0 : 0.3;
    let contrast = 1.0;

    if (isDay) {
      if (isCloudy) {
        // Der "Grauschleier": Multiply nimmt physikalisch Licht aus dem Bild
        multiplyColor = '#334155'; // Slate-700
        multiplyOpacity = activeCode === 3 ? 0.65 : 0.4; 
        saturation = activeCode === 3 ? 0.35 : 0.6; // Farbe entziehen bei Wolken
        brightness = activeCode === 3 ? 0.55 : 0.8; // Helligkeit massiv senken
        contrast = 0.85; // Highlight Crushing
      } else if (isStormy) {
        multiplyColor = '#0f172a'; 
        multiplyOpacity = 0.8;
        saturation = 0.2;
        brightness = 0.45;
      } else if (activeCode === 0) {
        brightness = 1.05;
        saturation = 1.1;
      }
    } else {
      multiplyColor = '#020617';
      multiplyOpacity = 0.85;
    }

    return { multiplyColor, multiplyOpacity, saturation, brightness, contrast };
  }, [activeCode, isDay]);

  useEffect(() => {
    if (!targetImage || targetImage === currentImage) return;
    setNextImage(targetImage);
    const img = new Image();
    img.src = targetImage;
    img.onload = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImage(targetImage);
        setIsTransitioning(false);
      }, 3000);
    };
  }, [targetImage]);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-[4000ms] ${isDay ? 'bg-slate-900' : 'bg-black'}`}>
      <style>{`
        .bg-layer { position: absolute; inset: 0; background-size: cover; background-position: center; transition: opacity 3000ms ease-in-out; will-change: opacity, filter; }
        .atmosphere-overlay { position: absolute; inset: 0; mix-blend-mode: multiply; transition: all 4000ms ease-in-out; z-index: 5; }
      `}</style>

      {/* EBENE 1: IMAGE BUFFERS */}
      {currentImage && (
        <div 
          className="bg-layer" 
          style={{ 
            backgroundImage: `url('${currentImage}')`, 
            opacity: isTransitioning ? 0 : 1, 
            filter: `brightness(${envConfig.brightness}) saturate(${envConfig.saturation}) contrast(${envConfig.contrast})` 
          }} 
        />
      )}
      {nextImage && isTransitioning && (
        <div 
          className="bg-layer" 
          style={{ 
            backgroundImage: `url('${nextImage}')`, 
            opacity: 1, 
            filter: `brightness(${envConfig.brightness}) saturate(${envConfig.saturation}) contrast(${envConfig.contrast})` 
          }} 
        />
      )}

      {/* EBENE 2: PROFESSIONAL ATMOSPHERE LAYER (MULTIPLY) */}
      <div 
        className="atmosphere-overlay" 
        style={{ 
          backgroundColor: envConfig.multiplyColor, 
          opacity: envConfig.multiplyOpacity 
        }} 
      />

      {/* EBENE 3: DEZENTE VIGNETTE */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 z-10" />
    </div>
  );
};

export default WeatherBackground;
