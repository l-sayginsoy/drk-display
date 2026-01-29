
import React, { useState, useEffect, useMemo } from 'react';

/**
 * WEATHER BACKGROUND KOMPONENTE - VERSION 4.0 (Atmospheric Engineering)
 * - Crossfading: Verhindert schwarze Bildschirme durch Vorladen neuer Bilder.
 * - Wetter-Helligkeit: Passt Lichtstimmung an (Dunkler bei Regen/Wolken).
 * - Pure Nature: Nur harmonische Naturmotive.
 */
const WeatherBackground: React.FC<{ code: number | undefined; isDay: boolean }> = ({ code, isDay }) => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [nextImage, setNextImage] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeCode = code ?? -1; // -1 für Initialzustand

  // Bildwahl nach Wetterlage (Reine Naturästhetik)
  const targetImage = useMemo(() => {
    if (activeCode === -1) return ''; // Kein Bild im Initialzustand (Gradient Fallback)

    // Falls sonnig (0)
    if (activeCode === 0) 
      return isDay 
        ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=2400&auto=format&fit=crop';
    
    // Gewitter (95+)
    if (activeCode >= 95) 
      return 'https://images.unsplash.com/photo-1504159506876-f8338247a14a?q=80&w=2400&auto=format&fit=crop';
    
    // Schnee (71-86)
    if ((activeCode >= 71 && activeCode <= 77) || activeCode === 85 || activeCode === 86)
      return 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=2400&auto=format&fit=crop';
    
    // Regen (51-67, 80-82)
    if ((activeCode >= 51 && activeCode <= 67) || (activeCode >= 80 && activeCode <= 82)) {
      return isDay 
        ? 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=2400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2400&auto=format&fit=crop';
    }
    
    // Nebel (45-48)
    if (activeCode >= 45 && activeCode <= 48) 
      return 'https://images.unsplash.com/photo-1485236715528-932aa7d74e94?q=80&w=2400&auto=format&fit=crop';
    
    // Bewölkt (1-3)
    return isDay 
      ? 'https://images.unsplash.com/photo-1483977399921-6cf3832f79a1?q=80&w=2400&auto=format&fit=crop' // Moody Bewölkt
      : 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?q=80&w=2400&auto=format&fit=crop';
  }, [activeCode, isDay]);

  // Effekt für weiches Überblenden und Vorladen
  useEffect(() => {
    if (!targetImage) return;
    if (targetImage === currentImage) return;

    setNextImage(targetImage);
    const img = new Image();
    img.src = targetImage;
    img.onload = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImage(targetImage);
        setIsTransitioning(false);
      }, 3000); // 3 Sekunden weicher Übergang
    };
  }, [targetImage]);

  // Wetter-spezifische Filtersteuerung (Helligkeit anpassen!)
  const getFilterStyles = (code: number, day: boolean) => {
    let brightness = day ? 1.0 : 0.35;
    let saturate = day ? 1.0 : 0.6;
    let contrast = 1.0;

    // Reduziere Helligkeit wenn bewölkt oder regnerisch
    if (code >= 1 && code <= 82) {
      brightness *= 0.75; // Deutlich dunkler bei Wolken/Regen
      saturate *= 0.8;
      contrast = 1.1;
    } else if (code >= 95) {
      brightness *= 0.6;
      contrast = 1.3;
    } else if (code === 0 && day) {
      brightness = 1.15; // Strahlend hell bei Sonne
      saturate = 1.2;
    }

    return {
      filter: `brightness(${brightness}) saturate(${saturate}) contrast(${contrast})`,
    };
  };

  const showSun = activeCode === 0 && isDay;
  const showClouds = (activeCode >= 1 && activeCode <= 3) || activeCode === 0;

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none transition-colors duration-[4000ms] ${isDay ? 'bg-slate-500' : 'bg-slate-950'}`}>
      <style>{`
        @keyframes cloudDriftSlow {
          0% { transform: translate3d(-10%, 0, 0); }
          50% { transform: translate3d(5%, 2%, 0); }
          100% { transform: translate3d(-10%, 0, 0); }
        }
        @keyframes sunRayRotation {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .natural-cloud {
          position: absolute;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }
        .bg-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 3000ms ease-in-out;
        }
      `}</style>

      {/* EBENE 1: GRADIENT FALLBACK (Verhindert Schwarz während Initialisierung) */}
      <div className={`absolute inset-0 transition-opacity duration-[3000ms] ${isDay ? 'bg-gradient-to-br from-sky-400 to-slate-400' : 'bg-slate-900'}`} />

      {/* EBENE 2: DAS AKTUELLE BILD */}
      {currentImage && (
        <div 
          className="bg-layer"
          style={{ 
            backgroundImage: `url('${currentImage}')`,
            opacity: isTransitioning ? 0 : 1,
            ...getFilterStyles(activeCode, isDay)
          }}
        />
      )}

      {/* EBENE 3: DAS NÄCHSTE BILD (Faded rein) */}
      {nextImage && isTransitioning && (
        <div 
          className="bg-layer"
          style={{ 
            backgroundImage: `url('${nextImage}')`,
            opacity: 1,
            ...getFilterStyles(activeCode, isDay)
          }}
        />
      )}

      {/* SONNEN-EFFEKTE (NUR BEI SONNE) */}
      {showSun && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[10%] w-[150vw] h-[150vw] bg-conic-gradient from-transparent via-white/5 to-transparent animate-[sunRayRotation_200s_linear_infinite]" 
               style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,220,0.05) 5%, transparent 10%)' }} />
          <div className="absolute top-[5%] left-[5%] w-[50vw] h-[50vw] bg-yellow-100/10 rounded-full blur-[120px]" />
        </div>
      )}

      {/* WOLKEN-SIMULATION (Dezenter) */}
      {showClouds && (
        <div className="absolute inset-0 opacity-40">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="natural-cloud"
              style={{
                width: `${60 + i * 20}vw`,
                height: `${40 + i * 10}vh`,
                top: `${(i * 20) % 60}%`,
                left: `${(i * 30) % 80}%`,
                opacity: isDay ? 0.3 : 0.1,
                animation: `cloudDriftSlow ${150 + i * 40}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* FINALE VIGNETTE */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-30" />
    </div>
  );
};

export default WeatherBackground;
