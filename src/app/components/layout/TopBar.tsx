import React from 'react';
import { Mail, MessageCircle, Download, Bell, HelpCircle } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-xl font-bold text-gray-800">서울종로약국</h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notification Banner - Top Centerish in original but putting it right side for standard layout */}



      </div>
    </header>
  );
};
