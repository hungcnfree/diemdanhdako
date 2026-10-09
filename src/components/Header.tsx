import React from 'react';
import { getShortTeacherWish } from '../utils/date';

interface HeaderProps {
  selectedDate?: string;
  onChangeDate?: (date: string) => void;
  selectedSession?: 'Sáng' | 'Chiều';
  onChangeSession?: (session: 'Sáng' | 'Chiều') => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const wish = getShortTeacherWish();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white shadow-md shadow-blue-500/15 rounded-b-2xl py-3 px-4 text-center">
      {/* Lời chào chúc ngắn tới quý thầy cô */}
      <p className="text-xs sm:text-sm font-bold text-white/95 tracking-wide">
        {wish}
      </p>
    </header>
  );
};
