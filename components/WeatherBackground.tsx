
import React, { useState, useEffect, useMemo } from 'react';

/**
 * WEATHER BACKGROUND KOMPONENTE - VERSION 5.0 (Professional Environmental Engine)
 * - Multiply Blending: Verwendet professionelle Layer-Technik zur Licht-Extraktion.
 * - Highlight Crushing: Verhindert, dass weiße Bildbereiche bei Wolken blendend wirken.
 * - Flat-Light Assets: Nutzt Bilder ohne harten Schattenwurf für realistische Bewölkung.
 */
const WeatherBackground: React.FC<{ code: number | undefined; isDay: boolean }> = ({ code, isDay }) => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [nextImage, setNextImage] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeCode = code ?? -1; 

  // Professionelle Bildwahl: Fokus auf diffuse Lichtstimmung (Flat Light)
  const targetImage = useMemo(() => {
    if (activeCode === -1) return '';

    // SONNE (0)
    if (activeCode === 0) 
      return isDay 
        ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=2400&auto=format&fit=crop';
    
    // BEWÖLKT (1-3) - Flaches, graues Licht ohne harten Kontrast
    if (activeCode >= 1 && activeCode <= 3)
      return isDay
        ? 'https://images.unsplash.com/photo-1445262102387-5fbb30a5e59d?q=80&w=2400&auto=format&fit=crop' // Moody Overcast Nature
        : 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=2400&auto=format&fit=crop';

    // REGEN / NEBEL (45-67, 80-82)
    if ((activeCode >= 45 && activeCode <= 67) || (activeCode >= 80 && activeCode <= 82))
      return 'https://images.unsplash.com/photo-1428592953211-077101b2021b?q=80&w=2400&auto=format&fit=crop'; // Rain/Fog nature
    
    // SCHNEE (71-77, 85-86)
    return 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=2400&auto=format&fit=crop';
  }, [activeCode, isDay]);

  // Umwelt-Konfiguration (Licht & Atmosphäre)
  const envConfig = useMemo(() => {
    const isCloudy = activeCode >= 1 && activeCode <= 82;
    const isStormy = activeCode >= 95;

    let multiplyColor = 'transparent';
    let multiplyOpacity = 0;
    let saturation = isDay ? 1.0 : 0.5;
    let brightness = isDay ? 1.0 : 0.4;
    let contrast = 1.0;

    if (isDay) {
      if (isCloudy) {
        // Der "Grauschleier": Multiply mit Graublau nimmt die Leuchtkraft aus dem Bild
        multiplyColor = '#475569'; // Slate-600
        multiplyOpacity = activeCode === 3 ? 0.5 : 0.35; 
        saturation = 0.6; // Entsättigung für flaches Licht
        brightness = 0.85; 
        contrast = 0.85; // Highlight Crushing: Drückt weiße Wolken flach
      } else if (isStormy) {
        multiplyColor = '#1e293b'; 
        multiplyOpacity = 0.7;
        saturation = 0.4;
        brightness = 0.6;
      } else if (activeCode === 0) {
        // Strahlende Sonne
        brightness = 1.1;
        saturation = 1.1;
      }
    } else {
      // Nacht-Modus (Immer Multiply für Tiefe)
      multiplyColor = '#0f172a';
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

  const filterStyle = {
    filter: `brightness(${envConfig.brightness}) saturate(${envConfig.saturation}) contrast(${envConfig.contrast})`,
  };

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none transition-colors duration-[4000ms] ${isDay ? 'bg-slate-700' : 'bg-slate-950'}`}>
      <style>{`
        .bg-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 3000ms ease-in-out;
          will-change: opacity, filter;
        }
        .atmosphere-overlay {
          position: absolute;
          inset: 0;
          mix-blend-mode: multiply;
          transition: background-color 4000ms ease-in-out, opacity 4000ms ease-in-out;
          z-index: 5;
        }
        @keyframes cloudDrift {
          from { transform: translate3d(-10%, 0, 0); }
          to { transform: translate3d(5%, 2%, 0); }
        }
      `}</style>

      {/* EBENE 1: GRADIENT BASE */}
      <div className={`absolute inset-0 ${isDay ? 'bg-gradient-to-br from-slate-400 to-slate-600' : 'bg-slate-900'}`} />

      {/* EBENE 2: IMAGE BUFFERS */}
      {currentImage && (
        <div 
          className="bg-layer"
          style={{ 
            backgroundImage: `url('${currentImage}')`,
            opacity: isTransitioning ? 0 : 1,
            ...filterStyle
          }}
        />
      )}
      {nextImage && isTransitioning && (
        <div 
          className="bg-layer"
          style={{ 
            backgroundImage: `url('${nextImage}')`,
            opacity: 1,
            ...filterStyle
          }}
        />
      )}

      {/* EBENE 3: PROFESSIONAL ATMOSPHERE LAYER (MULTIPLY) */}
      <div 
        className="atmosphere-overlay"
        style={{ 
          backgroundColor: envConfig.multiplyColor,
          opacity: envConfig.multiplyOpacity
        }}
      />

      {/* EBENE 4: DEZENTE WOLKEN (NUR BEI BEWÖLKUNG/REGEN) */}
      {activeCode > 0 && (
        <div className="absolute inset-0 opacity-20 mix-blend-screen">
          <div className="absolute top-0 left-0 w-[200vw] h-full bg-repeat-x opacity-30"
               style={{ 
                 backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                 animation: 'cloudDrift 180s linear infinite alternate'
               }} />
        </div>
      )}

      {/* FINALE VIGNETTE FÜR TIEFE */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 z-10" />
    </div>
  );
};

export default WeatherBackground;
