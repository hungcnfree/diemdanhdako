import React, { useState, useMemo } from 'react';
import { Send } from 'lucide-react';
import { parseAttendanceText } from '../utils/speech';
import { ParsedStudent } from '../types/attendance';

interface QuickInputProps {
  onSend: (parsedClass: string, students: ParsedStudent[], isFull: boolean) => void;
  onOpenClassPicker?: () => void;
  onReportClassFull?: (cls?: string) => void;
  selectedClass: string;
}

export const QuickInput: React.FC<QuickInputProps> = ({
  onSend,
  onReportClassFull,
  selectedClass,
}) => {
  const [text, setText] = useState('');

  // Real-time parsing of typed text
  const parsed = useMemo(() => {
    return parseAttendanceText(text);
  }, [text]);

  // Detected class from text, or fallback to selectedClass
  const effectiveClass = parsed.lop || selectedClass;

  const handleSend = () => {
    const rawTrimmed = text.trim();
    if (!rawTrimmed) return;

    if (!effectiveClass) {
      alert('Vui lòng nhập hoặc chọn Lớp trước khi gửi (VD: 8a4)!');
      return;
    }

    if (!parsed.isFull && parsed.students.length === 0) {
      alert('Chưa nhận diện được học sinh nào! Cú pháp mẫu: 8a4 HS1 p hoặc 0p, HS2 p hoặc 0p');
      return;
    }

    onSend(effectiveClass, parsed.students, parsed.isFull);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-100/70 p-4 rounded-3xl border border-blue-200/60 shadow-xs mb-4">
      {/* Top action row */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-black text-blue-900 tracking-wide uppercase">
          NHẬP NHANH ĐIỂM DANH
        </div>
        <div className="flex items-center gap-1.5">
          {onReportClassFull && (
            <button
              type="button"
              onClick={() => onReportClassFull()}
              className="flex items-center justify-center text-[11px] font-bold bg-emerald-600 text-white px-3 py-1 rounded-full shadow-2xs hover:bg-emerald-700 active:scale-95 transition"
            >
              <span>Báo Đủ</span>
            </button>
          )}
        </div>
      </div>

      {/* Main input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="8a4 HS1 p hoặc 0p, HS2 p hoặc 0p"
            className="w-full bg-white text-slate-800 text-sm sm:text-base font-semibold px-3.5 py-3.5 rounded-2xl border-2 border-blue-300 focus:border-blue-600 focus:outline-hidden focus:ring-3 focus:ring-blue-500/20 shadow-xs placeholder:text-slate-400 placeholder:font-normal transition"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="shrink-0 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition"
        >
          <Send className="w-4 h-4" />
          <span className="text-sm">Gửi</span>
        </button>
      </div>

      {/* Syntax hint */}
      <div className="mt-2 text-xs text-slate-600 flex items-center justify-between px-1 font-medium">
        <span>
          Cú pháp mẫu: <b className="text-blue-800">8a4 HS1 p hoặc 0p, HS2 p hoặc 0p</b>
        </span>
      </div>
    </div>
  );
};
