import React, { useState, useMemo } from 'react';
import { Search, Trash2, Lock, X } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';
import { formatShortDate } from '../utils/date';

interface AttendanceListProps {
  records: AttendanceRecord[];
  onDeleteRecord: (id: number | string) => void;
  onToggleStatus: (id: number | string, currentStatus: 'Có phép' | 'Không phép') => void;
  selectedDate: string;
  selectedSession: 'Sáng' | 'Chiều';
}

export const AttendanceList: React.FC<AttendanceListProps> = ({
  records,
  onDeleteRecord,
  onToggleStatus,
  selectedDate,
  selectedSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Có phép' | 'Không phép'>('all');

  // Security password modal state for deletion
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name: string } | null>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const handleConfirmDelete = () => {
    if (passcode.trim() !== '2026') {
      setPasscodeError('Mã bảo mật không đúng!');
      return;
    }

    if (deleteTarget) {
      onDeleteRecord(deleteTarget.id);
    }
    setDeleteTarget(null);
    setPasscode('');
    setPasscodeError('');
  };

  // Filter only absentees (exclude 'Đủ sĩ số')
  const absentees = useMemo(() => {
    return records.filter(r => r.trangthai !== 'Đủ');
  }, [records]);

  // Unique classes present in current list
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    absentees.forEach(r => {
      if (r.lop) set.add(r.lop);
    });
    return Array.from(set).sort();
  }, [absentees]);

  const filtered = useMemo(() => {
    return absentees.filter(r => {
      if (classFilter !== 'all' && r.lop !== classFilter) return false;
      if (statusFilter !== 'all' && r.trangthai !== statusFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = r.ten.toLowerCase().includes(query);
        const matchLop = r.lop.toLowerCase().includes(query);
        if (!matchName && !matchLop) return false;
      }
      return true;
    });
  }, [absentees, classFilter, statusFilter, searchTerm]);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
            <span>📋</span>
            <span>Danh Sách Học Sinh Vắng</span>
          </h3>
          <p className="text-xs text-slate-500">
            {filtered.length} học sinh • Nhấn vào thẻ P/KP để đổi trạng thái
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-2 mb-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh hoặc lớp..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter select pills */}
        <div className="flex gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">Tất cả lớp ({absentees.length})</option>
            {availableClasses.map(c => (
              <option key={c} value={c}>
                Lớp {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="Có phép">Có phép (P)</option>
            <option value="Không phép">Không phép (KP)</option>
          </select>
        </div>
      </div>

      {/* Records List / Mobile Cards */}
      {filtered.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <div className="text-3xl mb-1">🎉</div>
          <p className="text-sm font-semibold text-slate-600">
            {absentees.length === 0
              ? 'Không có học sinh vắng trong khoảng thời gian này'
              : 'Không tìm thấy học sinh phù hợp với bộ lọc'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Lớp học đang duy trì sĩ số rất tốt!
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map(record => {
            const isExcused = record.trangthai === 'Có phép';
            return (
              <div
                key={record.id || `${record.lop}-${record.ten}-${record.ngay}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/70 transition"
              >
                {/* Left: Info */}
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-lg text-xs">
                      {record.lop}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {formatShortDate(record.ngay)} • {record.buoi}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {record.ten}
                  </h4>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => record.id && onToggleStatus(record.id, record.trangthai as any)}
                    title="Nhấn để đổi P/KP"
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 shadow-2xs ${
                      isExcused
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                    }`}
                  >
                    {isExcused ? 'P (Có phép)' : 'KP (Không)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (record.id) {
                        setDeleteTarget({ id: record.id, name: record.ten });
                        setPasscode('');
                        setPasscodeError('');
                      }
                    }}
                    title="Xóa học sinh này"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nhập Mã Bảo Mật Để Xóa */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>

            <h4 className="text-base font-extrabold text-slate-800 mb-1">
              Xác Nhận Xóa Học Sinh
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Nhập mã bảo mật để xóa em <b>{deleteTarget.name}</b>:
            </p>

            <div className="mb-3">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmDelete();
                }}
                placeholder="••••"
                className="w-full py-2.5 px-3 text-center text-lg font-black tracking-widest text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-rose-500 focus:bg-white transition"
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-rose-600 font-bold mt-1.5">{passcodeError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 shadow-md shadow-rose-500/25 transition"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
