import React, { useState } from 'react';
import { Lock, Download, Share2, X, Check, FileSpreadsheet } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';
import { getLocalDateString } from '../utils/date';

interface ExportModalProps {
  isOpen: boolean;
  records: AttendanceRecord[];
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  records,
  onClose,
  onSuccessToast,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const verifyPassword = (input: string): boolean => {
    // Secret "2026"
    return input.trim() === '2026';
  };

  const handleExport = async (mode: 'download' | 'share') => {
    setErrorMsg('');
    if (!verifyPassword(password)) {
      setErrorMsg('Mã bảo mật không đúng! Vui lòng thử lại.');
      return;
    }

    setIsExporting(true);

    try {
      // Build UTF-8 CSV with BOM for proper Vietnamese Excel display
      let csvContent = '\uFEFF"Ngày","Buổi","Lớp","Họ và Tên","Trạng thái"\n';

      // Sort by date descending
      const sorted = [...records].sort((a, b) => (b.ngay > a.ngay ? 1 : -1));

      sorted.forEach(r => {
        const cleanName = (r.ten || '').replace(/"/g, '""');
        const cleanLop = (r.lop || '').replace(/"/g, '""');
        const cleanBuoi = (r.buoi || '').replace(/"/g, '""');
        const cleanStatus = (r.trangthai || '').replace(/"/g, '""');
        csvContent += `"${r.ngay}","${cleanBuoi}","${cleanLop}","${cleanName}","${cleanStatus}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `DiemDanh_${getLocalDateString(new Date())}.csv`;

      // Try Web Share API for mobile if requested
      if (mode === 'share' && navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: 'text/csv' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Báo cáo Điểm danh',
            text: `File xuất điểm danh ngày ${getLocalDateString(new Date())}`,
          });
          onSuccessToast('Đã chia sẻ file thành công!');
          onClose();
          return;
        }
      }

      // Fallback or explicit download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onSuccessToast('Đã xuất file Excel (CSV) thành công!');
      onClose();
    } catch (err: any) {
      console.warn('Export error:', err);
      setErrorMsg('Lỗi khi xuất file: ' + (err.message || 'Thử lại'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Xuất Báo Cáo Excel</h3>
              <p className="text-[11px] text-slate-400">Định dạng CSV chuẩn tiếng Việt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
            Nhập mã bảo mật để tiếp tục:
          </label>
          <div className="relative mb-2">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="••••"
              className="w-full pl-9 pr-3 py-3 text-center text-lg font-black tracking-widest text-slate-800 bg-slate-50 border-2 border-blue-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition"
              autoFocus
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 text-center font-semibold mb-2">
              {errorMsg}
            </p>
          )}

          <div className="space-y-2 mt-4">
            <button
              type="button"
              onClick={() => handleExport('download')}
              disabled={isExporting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Tải Về Máy (File CSV)</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={() => handleExport('share')}
                disabled={isExporting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Gửi Qua Zalo / Mail / Ứng Dụng Khác</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
