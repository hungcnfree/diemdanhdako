import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { DEFAULT_SCHOOL_CLASSES } from '../lib/supabase';

interface ClassPickerSheetProps {
  isOpen: boolean;
  selectedClass?: string;
  title?: string;
  subtitle?: string;
  onSelect: (className: string) => void;
  onClose: () => void;
}

export const ClassPickerSheet: React.FC<ClassPickerSheetProps> = ({
  isOpen,
  selectedClass = '',
  title = 'Chọn Lớp Học',
  subtitle = 'Chạm để chọn nhanh lớp cần điểm danh',
  onSelect,
  onClose,
}) => {
  const [activeGrade, setActiveGrade] = useState<'all' | '6' | '7' | '8' | '9'>('all');

  if (!isOpen) return null;

  const grades = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Khối 6', value: '6' },
    { label: 'Khối 7', value: '7' },
    { label: 'Khối 8', value: '8' },
    { label: 'Khối 9', value: '9' },
  ];

  const filteredClasses = DEFAULT_SCHOOL_CLASSES.filter(c => {
    if (activeGrade === 'all') return true;
    return c.startsWith(activeGrade);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/50 backdrop-blur-xs transition-opacity p-0 sm:p-4">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-5 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade tabs */}
        <div className="flex gap-1.5 py-3 overflow-x-auto no-scrollbar">
          {grades.map(g => (
            <button
              key={g.value}
              onClick={() => setActiveGrade(g.value as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeGrade === g.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-4 gap-2.5 py-2 overflow-y-auto max-h-[50vh] pr-1">
          {filteredClasses.map(cls => {
            const isSelected = selectedClass.toUpperCase() === cls.toUpperCase();
            return (
              <button
                key={cls}
                onClick={() => {
                  onSelect(cls);
                  onClose();
                }}
                className={`flex items-center justify-center gap-1 py-3 px-2 rounded-xl text-base font-bold transition active:scale-95 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                <span>{cls}</span>
                {isSelected && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 mt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
