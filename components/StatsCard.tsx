
import React from 'react';
import { Icons } from '../constants';
import { StatsItem } from '../types';

const StatsCard: React.FC<StatsItem> = ({ label, value, trend, icon }) => {
  const isPositive = trend > 0;

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">
            {/* Simple icon mapping or just a placeholder since icon names aren't actual components here */}
            <div className="p-2 bg-slate-900 rounded-lg">
                <Icons.Analytics className="w-6 h-6" />
            </div>
        </div>
        <div className={`flex items-center space-x-1 text-sm font-semibold px-2 py-1 rounded-full ${
          isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
        }`}>
          {isPositive ? <Icons.TrendUp /> : <Icons.TrendDown />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{label}</h3>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
