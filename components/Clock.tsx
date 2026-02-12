
import React from 'react';

interface ClockProps {
    timeString: string;
    dateString: string;
}

const Clock: React.FC<ClockProps> = ({ timeString, dateString }) => {
    // Split "Dienstag, 10. Februar" into "Dienstag" and "10. Februar"
    const dateParts = dateString.split(',');
    const weekday = dateParts[0] || '';
    const date = (dateParts[1] || '').trim();

    return (
        <div className="flex items-center space-x-[1.8vmin]">
            <h1 
              className="font-black leading-none tracking-tighter"
              style={{ fontSize: 'clamp(2.5rem, 8vmin, 7rem)' }}
            >
                {timeString}
            </h1>
            <div className="w-[2px] h-[6vmin] bg-white/30 rounded-full"></div>
            <div className="flex flex-col">
                 <p 
                   className="font-bold leading-none uppercase"
                   style={{ fontSize: 'clamp(1.4rem, 3.5vmin, 2.3rem)' }}
                 >{weekday}</p>
                 <p 
                   className="leading-tight text-white/75 mt-[0.4vmin]"
                   style={{ fontSize: 'clamp(1.1rem, 2.8vmin, 1.8rem)' }}
                 >{date}</p>
            </div>
        </div>
    );
};

export default Clock;
