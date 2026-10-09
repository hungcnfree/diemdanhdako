import React, { useEffect, useState } from 'react';
import { Check, Sparkles, Trophy, HeartHandshake } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';
import { getRandomTeacherRewardQuote, TeacherQuote } from '../utils/teacherQuotes';
import confetti from 'canvas-confetti';

interface ResultModalProps {
  isOpen: boolean;
  lop: string;
  records: AttendanceRecord[];
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  lop,
  records,
  onClose,
}) => {
  const [quote, setQuote] = useState<TeacherQuote | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Pick random inspiring reward quote for teacher
      const randomQuote = getRandomTeacherRewardQuote();
      setQuote(randomQuote);

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.55 },
          colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        });

        // Haptic reward vibration
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 60, 40, 80]);
        }
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isFull = records.some(r => r.trangthai === 'Đủ');
  const absentList = records.filter(r => r.trangthai !== 'Đủ');
  const countP = absentList.filter(r => r.trangthai === 'Có phép').length;
  const countKP = absentList.filter(r => r.trangthai === 'Không phép').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-white via-slate-50 to-amber-50/40 rounded-3xl p-6 shadow-2xl text-center border-2 border-amber-300/70 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Reward Badge Icon */}
        <div className="relative inline-block mb-2.5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-amber-900 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/35 border-2 border-white ring-4 ring-amber-100 animate-bounce duration-1000 text-4xl">
            {quote?.badge || '🌟'}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Thank You Title */}
        <h3 className="text-xl font-black text-slate-800 mb-0.5 tracking-tight">
          Cảm Ơn Thầy Cô!
        </h3>
        <p className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-3">
          Điểm Danh Lớp {lop} Thành Công 🎉
        </p>

        {/* Teacher Inspiring Quote Card (Reward style) */}
        {quote && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50/60 to-orange-50 border border-amber-200/90 shadow-sm text-left relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                <HeartHandshake className="w-3 h-3 text-amber-700" />
                {quote.tag}
              </span>
              <span className="text-[10px] font-bold text-amber-600">Dành tặng thầy cô</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 italic leading-relaxed">
              &ldquo;{quote.content}&rdquo;
            </p>
          </div>
        )}

        {/* Attendance Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-700 mb-4 shadow-2xs">
          {isFull ? (
            <div className="text-emerald-700 flex items-center justify-center gap-1">
              <span>🌟</span>
              <span>Lớp <b>{lop}</b> báo cáo: <b>ĐỦ SĨ SỐ</b> (0 vắng)</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Tổng vắng: <strong className="text-rose-600 font-extrabold">{absentList.length} em</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {countP} Có phép (P)
                </span>
                <span className="text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                  {countKP} Không phép (0P)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Tiếp Tục Giảng Dạy ✨</span>
        </button>
      </div>
    </div>
  );
};
