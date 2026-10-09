import React, { useMemo, useState } from 'react';
import { Download, AlertCircle, CheckCircle2, TrendingUp, Calendar, Filter, Users, Sparkles } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';
import { DEFAULT_SCHOOL_CLASSES } from '../lib/supabase';
import { getLocalDateString } from '../utils/date';
import confetti from 'canvas-confetti';

interface StatisticsTabProps {
  records: AttendanceRecord[];
  onOpenExportModal: () => void;
  onQuickMarkClassFull: (cls: string) => void;
  selectedDate: string;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({
  records,
  onOpenExportModal,
  onQuickMarkClassFull,
  selectedDate,
}) => {
  const [timeFilter, setTimeFilter] = useState<'selected' | 'today' | 'yesterday' | '7days' | 'all'>('selected');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedMissingClass, setSelectedMissingClass] = useState<string | null>(null);

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  }, []);

  // Filter records based on selected timeframe
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Time filter
      if (timeFilter === 'selected') {
        if (r.ngay !== selectedDate) return false;
      } else if (timeFilter === 'today') {
        if (r.ngay !== todayStr) return false;
      } else if (timeFilter === 'yesterday') {
        if (r.ngay !== yesterdayStr) return false;
      } else if (timeFilter === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        if (r.ngay < getLocalDateString(d)) return false;
      }

      // Class filter
      if (classFilter !== 'all' && r.lop !== classFilter) {
        return false;
      }

      return true;
    });
  }, [records, timeFilter, selectedDate, todayStr, yesterdayStr, classFilter]);

  // Absentees only
  const absentees = useMemo(() => {
    return filteredRecords.filter(r => r.trangthai !== 'Đủ');
  }, [filteredRecords]);

  const countSang = absentees.filter(r => r.buoi === 'Sáng').length;
  const countChieu = absentees.filter(r => r.buoi === 'Chiều').length;
  const countP = absentees.filter(r => r.trangthai === 'Có phép').length;
  const countKP = absentees.filter(r => r.trangthai === 'Không phép').length;

  // Track classes that have reported attendance for the target date
  const targetDateForMissing = timeFilter === 'yesterday' ? yesterdayStr : (timeFilter === 'today' ? todayStr : selectedDate);
  const reportedClasses = useMemo(() => {
    const set = new Set<string>();
    records.filter(r => r.ngay === targetDateForMissing).forEach(r => set.add(r.lop));
    return set;
  }, [records, targetDateForMissing]);

  const missingClasses = useMemo(() => {
    return DEFAULT_SCHOOL_CLASSES.filter(c => !reportedClasses.has(c));
  }, [reportedClasses]);

  const completionPercent = Math.round(
    ((DEFAULT_SCHOOL_CLASSES.length - missingClasses.length) / DEFAULT_SCHOOL_CLASSES.length) * 100
  );

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Filter Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Bộ Lọc Dữ Liệu</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Lọc báo cáo</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Thời gian:
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
            >
              <option value="selected">Ngày đang chọn ({selectedDate})</option>
              <option value="today">Hôm nay ({todayStr})</option>
              <option value="yesterday">Hôm qua ({yesterdayStr})</option>
              <option value="7days">7 ngày qua</option>
              <option value="all">Tất cả thời gian</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Lớp:
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
            >
              <option value="all">Toàn bộ các lớp</option>
              {DEFAULT_SCHOOL_CLASSES.map(cls => (
                <option key={cls} value={cls}>
                  Lớp {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-3.5 text-white shadow-md shadow-emerald-500/20 text-center flex flex-col justify-center">
          <div className="text-2xl sm:text-3xl font-black tracking-tight">{absentees.length}</div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100 mt-0.5">
            TỔNG VẮNG
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-3xl p-3.5 text-white shadow-md shadow-blue-500/20 text-center flex flex-col justify-center">
          <div className="text-2xl sm:text-3xl font-black tracking-tight">{countSang}</div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-100 mt-0.5">
            BUỔI SÁNG
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-3.5 text-white shadow-md shadow-amber-500/20 text-center flex flex-col justify-center">
          <div className="text-2xl sm:text-3xl font-black tracking-tight">{countChieu}</div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-100 mt-0.5">
            BUỔI CHIỀU
          </div>
        </div>
      </div>

      {/* Sub metrics: P vs KP */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-around">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
            P
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-800">{countP} em</div>
            <div className="text-[10px] text-slate-500 font-medium">Có phép</div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs">
            KP
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-800">{countKP} em</div>
            <div className="text-[10px] text-slate-500 font-medium">Không phép</div>
          </div>
        </div>
      </div>

      {/* School Missing Classes Monitor */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>🏫</span>
              <span>Tiến Độ Báo Cáo Toàn Trường</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              {reportedClasses.size} / {DEFAULT_SCHOOL_CLASSES.length} lớp đã nộp ({completionPercent}%)
            </p>
          </div>

          {missingClasses.length === 0 && (
            <button
              onClick={triggerConfetti}
              className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Chúc mừng!
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {missingClasses.length === 0 ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <span className="text-sm font-extrabold text-emerald-700">
              🎉 Toàn bộ {DEFAULT_SCHOOL_CLASSES.length} lớp đã điểm danh xong!
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-bold text-rose-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Còn {missingClasses.length} lớp chưa báo cáo:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {missingClasses.map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedMissingClass(cls)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:scale-95 transition flex items-center gap-1"
                >
                  <span>{cls}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Chạm vào tên lớp ở trên để báo cáo nhanh đi Đủ!
            </p>
          </div>
        )}
      </div>

      {/* Export to Excel Button */}
      <button
        type="button"
        onClick={onOpenExportModal}
        className="w-full py-4 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition text-sm"
      >
        <Download className="w-4 h-4" />
        <span>XUẤT BÁO CÁO EXCEL (CSV)</span>
      </button>

      {/* Quick modal when tapping a missing class */}
      {selectedMissingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl font-black">
              {selectedMissingClass}
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">
              Điểm danh lớp {selectedMissingClass}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Lớp này chưa có dữ liệu điểm danh ngày {targetDateForMissing}.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onQuickMarkClassFull(selectedMissingClass);
                  setSelectedMissingClass(null);
                }}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 shadow-md transition"
              >
                🌟 Báo cáo lớp này ĐI ĐỦ
              </button>
              <button
                type="button"
                onClick={() => setSelectedMissingClass(null)}
                className="w-full py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
