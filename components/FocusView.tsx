import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTime } from '../hooks/useTime';
import { UrgentMessage, Meal, SlideshowData } from '../types';
import Slideshow from './Slideshow';
import MenuPlanView from './MenuPlanView';

// Props for the main component
interface FocusViewProps {
  urgentMessage: UrgentMessage;
  meals: Meal[];
  slideshow: SlideshowData;
}

// Reusable container with animation
interface ContentContainerProps {
    children?: React.ReactNode;
    imageUrl: string;
}
export const ContentContainer: React.FC<ContentContainerProps> = ({ children, imageUrl }) => (
    <motion.div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${imageUrl})` }}
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
);

// --- Sub-components for cleaner animation logic ---

const UrgentMessageView: React.FC<{ message: UrgentMessage }> = ({ message }) => (
    <ContentContainer imageUrl={message.imageUrl}>
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-8">
            <h1 className="font-black text-red-500 drop-shadow-lg" style={{ fontSize: 'clamp(1.8rem, 5vmin, 3.5rem)' }}>{message.title}</h1>
            <p className="mt-[1vh] drop-shadow-lg" style={{ fontSize: 'clamp(1.1rem, 3vmin, 2rem)' }}>{message.text}</p>
        </div>
    </ContentContainer>
);

const MealView: React.FC<{ meal: Meal }> = ({ meal }) => (
    <ContentContainer imageUrl={meal.imageUrl} />
);

// --- Main Component ---

const FocusView: React.FC<FocusViewProps> = ({ urgentMessage, meals, slideshow }) => {
  const { hour, minute } = useTime();

  const isTimeActive = (activeUntil: string): boolean => {
      if (!activeUntil || !activeUntil.includes(':')) return false;
      const [endHour, endMinute] = activeUntil.split(':').map(Number);
      const now = new Date();
      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0, 0);
      return now <= endTime;
  };

  const getCurrentMeal = (): Meal | null => {
    const currentTime = hour + minute / 60;
    for (const meal of meals) {
      const startTime = meal.startTime.hour + meal.startTime.minute / 60;
      const endTime = meal.endTime.hour + meal.endTime.minute / 60;
      if (currentTime >= startTime && currentTime <= endTime) {
        return meal;
      }
    }
    return null;
  };
  
  const renderContent = () => {
    // Prio 1: Urgent Message
    if (urgentMessage.active && isTimeActive(urgentMessage.activeUntil)) {
      return <UrgentMessageView key="urgent" message={urgentMessage} />;
    }

    // Prio 2: Meal Time (Corrected Priority)
    const currentMeal = getCurrentMeal();
    if (currentMeal) {
      return <MealView key={currentMeal.name} meal={currentMeal} />;
    }

    // Prio 3: Active Slideshow
    if (slideshow.active && isTimeActive(slideshow.activeUntil)) {
      return <Slideshow key="slideshow" images={slideshow.images} />;
    }
    
    // Prio 4: Fallback Menu Plan
    return <MenuPlanView key="menu-plan" />;
  };
  
  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden">
        <AnimatePresence mode="wait">
            {renderContent()}
        </AnimatePresence>
    </div>
  );
};

export default FocusView;