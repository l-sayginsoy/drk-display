import React, { useState, useEffect } from 'react';
import { SlideshowImage } from '../types';
import { ContentContainer } from './FocusView';

interface SlideshowProps {
  images: SlideshowImage[];
}

const Slideshow: React.FC<SlideshowProps> = ({ images }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000); // Change image every 10 seconds
    return () => clearTimeout(timer);
  }, [index, images.length]);

  if (!images || images.length === 0) {
    // Fallback to a default view if no images are available
    return (
        <ContentContainer key="no-slides" imageUrl="assets/Speiseplan.jpg">
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white text-2xl">Keine Bilder in der Diashow vorhanden.</p>
             </div>
        </ContentContainer>
    );
  }
  
  const currentImage = images[index];

  return (
    <ContentContainer key={currentImage.id} imageUrl={currentImage.url}>
        <div className="absolute bottom-0 left-0 right-0 p-[2vmin] bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white font-semibold drop-shadow-md text-right" style={{ fontSize: 'clamp(1rem, 2.5vmin, 1.8rem)' }}>
                {currentImage.caption}
            </p>
        </div>
    </ContentContainer>
  );
};

export default Slideshow;