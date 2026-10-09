import React, { useState, useId } from 'react';
import { UserCheck, UserX, CheckCircle, Sparkles, Layers } from 'lucide-react';
import { StudentSuggestion } from '../types/attendance';

interface ManualInputProps {
  selectedClass: string;
  onClassChange: (cls: string) => void;
  onOpenClassPicker: () => void;
  onSaveSingle: (ten: string, trangthai: 'Có phép' | 'Không phép') => void;
  onReportClassFull: () => void;
  studentSuggestions: StudentSuggestion[];
  isSubmitting: boolean;
}

export const ManualInput: React.FC<ManualInputProps> = ({
  selectedClass,
  onClassChange,
  onOpenClassPicker,
  onSaveSingle,
  onReportClassFull,
  studentSuggestions,
  isSubmitting,
}) => {
  const [ten, setTen] = useState('');
  const [trangthai, setTrangthai] = useState<'Có phép' | 'Không phép'>('Có phép');
  const datalistId = useId();

  // Filter autocomplete suggestions by selected class
  const filteredSuggestions = studentSuggestions.filter(s => {
    if (!selectedClass) return true;
    return s.lop.toUpperCase() === selectedClass.toUpperCase();
  });

  const handleSaveVang = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ten.trim();
    if (!selectedClass) {
      alert('Vui lòng nhập hoặc chọn Lớp!');
      return;
    }
    if (!trimmed) {
      alert('Vui lòng nhập Họ và Tên học sinh!');
      return;
    }

    onSaveSingle(trimmed, trangthai);
    setTen('');
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
          <span>📝</span>
          <span>Nhập Chi Tiết Từng Em</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">Gợi ý thông minh</span>
      </div>

      <form onSubmit={handleSaveVang} className="space-y-3">
        {/* Class and Status row */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Class input with quick picker button */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lớp:
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedClass}
                onChange={(e) => onClassChange(e.target.value.toUpperCase())}
                placeholder="VD: 8A4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 uppercase outline-none focus:border-blue-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={onOpenClassPicker}
                aria-label="Chọn danh sách lớp"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1 rounded-md"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trạng thái:
            </label>
            <select
              value={trangthai}
              onChange={(e) => setTrangthai(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="Có phép">Có phép (P)</option>
              <option value="Không phép">Không phép (KP)</option>
            </select>
          </div>
        </div>

        {/* Student name input with datalist suggestions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Họ và tên học sinh:
          </label>
          <div className="relative">
            <input
              type="text"
              list={datalistId}
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              placeholder="Gõ tên (tự gợi ý từ lịch sử)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
              autoComplete="off"
            />
            {filteredSuggestions.length > 0 && !ten && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full pointer-events-none">
                {filteredSuggestions.length} gợi ý
              </span>
            )}
          </div>
          <datalist id={datalistId}>
            {filteredSuggestions.slice(0, 30).map((s, idx) => (
              <option key={idx} value={s.ten}>
                {s.ten} ({s.lop})
              </option>
            ))}
          </datalist>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-98 transition disabled:opacity-50 text-sm"
          >
            <UserX className="w-4 h-4" />
            <span>LƯU HỌC SINH VẮNG</span>
          </button>

          <button
            type="button"
            onClick={onReportClassFull}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition disabled:opacity-50 text-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>BÁO CÁO LỚP ĐI ĐỦ</span>
          </button>
        </div>
      </form>
    </div>
  );
};
