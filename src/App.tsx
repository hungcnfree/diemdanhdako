import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchRecentAttendance,
  fetchStudentSuggestions,
  saveAttendanceRecords,
  deleteAttendanceRecord,
  updateAttendanceRecord,
} from './lib/supabase';
import { AttendanceRecord, StudentSuggestion, ParsedStudent } from './types/attendance';
import { getLocalDateString, getCurrentSession, formatFullTeacherTime } from './utils/date';
import { Header } from './components/Header';
import { QuickInput } from './components/QuickInput';
import { VoiceInput } from './components/VoiceInput';
import { AttendanceList } from './components/AttendanceList';
import { StatisticsTab } from './components/StatisticsTab';
import { ResultModal } from './components/ResultModal';
import { ExportModal } from './components/ExportModal';
import { ClassPickerSheet } from './components/ClassPickerSheet';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  ClipboardList,
  BarChart3,
  ListFilter,
} from 'lucide-react';

export default function App() {
  // Navigation & Date/Session state
  const [activeTab, setActiveTab] = useState<'input' | 'list' | 'report'>('input');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()));
  const [selectedSession, setSelectedSession] = useState<'Sáng' | 'Chiều'>(getCurrentSession());
  const [selectedClass, setSelectedClass] = useState<string>('8A4');

  // Data state
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [suggestions, setSuggestions] = useState<StudentSuggestion[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modals & Popups
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [classPickerOpen, setClassPickerOpen] = useState(false);
  const [reportFullPickerOpen, setReportFullPickerOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [resultPopup, setResultPopup] = useState<{
    isOpen: boolean;
    lop: string;
    records: AttendanceRecord[];
  }>({
    isOpen: false,
    lop: '',
    records: [],
  });

  // Duplicate prompt modal
  const [duplicatePrompt, setDuplicatePrompt] = useState<{
    isOpen: boolean;
    studentName: string;
    className: string;
    onConfirm: () => void;
  } | null>(null);

  // Initialize network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Đã kết nối lại Internet', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Đang ở chế độ ngoại tuyến', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(type === 'error' ? [50, 50, 50] : [30]);
      } catch {}
    }

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load data from Supabase
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await fetchRecentAttendance(30);
      if (data) {
        setRecords(data);
      }
      if (error) {
        showToast('Đang dùng dữ liệu ngoại tuyến', 'info');
      }

      const sug = await fetchStudentSuggestions();
      if (sug && sug.length > 0) {
        setSuggestions(sug);
      }
    } catch (e: any) {
      console.warn('Load data error:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save multiple students at once (from Quick Input or Voice)
  const handleSaveBatch = async (
    lop: string,
    students: ParsedStudent[],
    isFull: boolean
  ) => {
    if (!lop) {
      showToast('Chưa có thông tin Lớp!', 'warning');
      return;
    }

    const normLop = lop.trim().toUpperCase();
    setSelectedClass(normLop);
    setIsSubmitting(true);

    const newRecords: AttendanceRecord[] = [];

    if (isFull) {
      newRecords.push({
        buoi: selectedSession,
        ngay: selectedDate,
        lop: normLop,
        ten: 'Đủ sĩ số',
        trangthai: 'Đủ',
      });
    } else {
      for (const st of students) {
        newRecords.push({
          buoi: selectedSession,
          ngay: selectedDate,
          lop: normLop,
          ten: st.ten,
          trangthai: st.trangthai,
        });
      }
    }

    const { success, error } = await saveAttendanceRecords(newRecords);
    setIsSubmitting(false);

    if (success) {
      showToast(`Đã lưu điểm danh lớp ${normLop}`, 'success');
      // Update local state immediately for fast feedback
      setRecords(prev => [...newRecords, ...prev]);

      // Add to suggestions if not full
      if (!isFull) {
        setSuggestions(prev => {
          const updated = [...prev];
          students.forEach(st => {
            if (!updated.some(s => s.lop === normLop && s.ten.toLowerCase() === st.ten.toLowerCase())) {
              updated.unshift({ lop: normLop, ten: st.ten });
            }
          });
          return updated;
        });
      }

      // Show result popup
      setResultPopup({
        isOpen: true,
        lop: normLop,
        records: newRecords,
      });

      // Reload fresh data from cloud in background
      loadData();
    } else {
      showToast(`Lỗi: ${error || 'Không thể lưu'}`, 'error');
    }
  };

  // Save single student from manual form
  const handleSaveSingle = async (ten: string, trangthai: 'Có phép' | 'Không phép') => {
    if (!selectedClass) {
      showToast('Vui lòng nhập hoặc chọn Lớp!', 'warning');
      return;
    }

    const normLop = selectedClass.trim().toUpperCase();

    // Check if student already marked absent in this session
    const existing = records.find(
      r =>
        r.ngay === selectedDate &&
        r.buoi === selectedSession &&
        r.lop === normLop &&
        r.ten.toLowerCase() === ten.toLowerCase()
    );

    if (existing) {
      setDuplicatePrompt({
        isOpen: true,
        studentName: ten,
        className: normLop,
        onConfirm: async () => {
          setDuplicatePrompt(null);
          await proceedSaveSingle(normLop, ten, trangthai);
        },
      });
      return;
    }

    await proceedSaveSingle(normLop, ten, trangthai);
  };

  const proceedSaveSingle = async (
    normLop: string,
    ten: string,
    trangthai: 'Có phép' | 'Không phép'
  ) => {
    setIsSubmitting(true);
    const newRecord: AttendanceRecord = {
      buoi: selectedSession,
      ngay: selectedDate,
      lop: normLop,
      ten,
      trangthai,
    };

    const { success, error } = await saveAttendanceRecords([newRecord]);
    setIsSubmitting(false);

    if (success) {
      showToast(`Đã lưu em ${ten} (${trangthai})`, 'success');
      setRecords(prev => [newRecord, ...prev]);

      setSuggestions(prev => {
        if (!prev.some(s => s.lop === normLop && s.ten.toLowerCase() === ten.toLowerCase())) {
          return [{ lop: normLop, ten }, ...prev];
        }
        return prev;
      });

      // Show popup with updated list for this class today
      const classRecordsToday = [
        newRecord,
        ...records.filter(
          r => r.ngay === selectedDate && r.buoi === selectedSession && r.lop === normLop
        ),
      ];

      setResultPopup({
        isOpen: true,
        lop: normLop,
        records: classRecordsToday,
      });

      loadData();
    } else {
      showToast(`Lỗi: ${error}`, 'error');
    }
  };

  // Report full class
  const handleReportClassFull = async (targetClass?: string) => {
    const cls = (targetClass || selectedClass || '').trim().toUpperCase();
    if (!cls) {
      setClassPickerOpen(true);
      return;
    }

    setIsSubmitting(true);
    const newRecord: AttendanceRecord = {
      buoi: selectedSession,
      ngay: selectedDate,
      lop: cls,
      ten: 'Đủ sĩ số',
      trangthai: 'Đủ',
    };

    const { success, error } = await saveAttendanceRecords([newRecord]);
    setIsSubmitting(false);

    if (success) {
      showToast(`Lớp ${cls} đã báo cáo ĐỦ sĩ số`, 'success');
      setRecords(prev => [newRecord, ...prev]);
      setResultPopup({
        isOpen: true,
        lop: cls,
        records: [newRecord],
      });
      loadData();
    } else {
      showToast(`Lỗi: ${error}`, 'error');
    }
  };

  // Delete attendance record
  const handleDeleteRecord = async (id: number | string) => {
    if (!id) return;
    const { success, error } = await deleteAttendanceRecord(id);
    if (success) {
      setRecords(prev => prev.filter(r => String(r.id) !== String(id)));
      showToast('Đã xóa thành công', 'info');
    } else {
      showToast(`Lỗi xóa: ${error}`, 'error');
    }
  };

  // Toggle status between Có phép & Không phép
  const handleToggleStatus = async (
    id: number | string,
    currentStatus: 'Có phép' | 'Không phép'
  ) => {
    if (!id) return;
    const newStatus = currentStatus === 'Có phép' ? 'Không phép' : 'Có phép';
    const { success, error } = await updateAttendanceRecord(id, { trangthai: newStatus });
    if (success) {
      setRecords(prev =>
        prev.map(r => (String(r.id) === String(id) ? { ...r, trangthai: newStatus } : r))
      );
      showToast(`Đã chuyển sang ${newStatus}`, 'info');
    } else {
      showToast(`Lỗi cập nhật: ${error}`, 'error');
    }
  };

  // Absentees for current selected date & session
  const currentSessionAbsentees = records.filter(
    r => r.ngay === selectedDate && r.buoi === selectedSession && r.trangthai !== 'Đủ'
  );

  return (
    <div className="min-h-screen bg-slate-100/70 pb-24 text-slate-800 flex flex-col font-sans select-none">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sticky Top Header */}
      <Header
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
        selectedSession={selectedSession}
        onChangeSession={setSelectedSession}
      />

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto px-3.5 pt-3.5 flex-1">
        {/* TAB 1: ĐIỂM DANH */}
        {activeTab === 'input' && (
          <div className="space-y-1 animate-in fade-in duration-150">
            {/* Hiển thị thời gian: Buổi/Thứ/Ngày/Tháng/Năm(2 số cuối) */}
            <div className="flex items-center justify-center px-2 mb-2.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50/90 text-blue-900 border border-blue-200/80 rounded-xl text-xs font-black shadow-2xs">
                <span>📅</span>
                <span>{formatFullTeacherTime(selectedDate, selectedSession)}</span>
              </div>
            </div>

            {/* Quick Multi-student Input */}
            <QuickInput
              onSend={handleSaveBatch}
              onOpenClassPicker={() => setClassPickerOpen(true)}
              onReportClassFull={() => setReportFullPickerOpen(true)}
              selectedClass={selectedClass}
            />

            {/* Smart Voice Recognition */}
            <VoiceInput
              onSaveVoiceBatch={handleSaveBatch}
              selectedClass={selectedClass}
            />
          </div>
        )}

        {/* TAB 2: DANH SÁCH VẮNG */}
        {activeTab === 'list' && (
          <div className="animate-in fade-in duration-150">
            <AttendanceList
              records={records.filter(r => r.ngay === selectedDate)}
              onDeleteRecord={handleDeleteRecord}
              onToggleStatus={handleToggleStatus}
              selectedDate={selectedDate}
              selectedSession={selectedSession}
            />
          </div>
        )}

        {/* TAB 3: THỐNG KÊ */}
        {activeTab === 'report' && (
          <div className="animate-in fade-in duration-150">
            <StatisticsTab
              records={records}
              onOpenExportModal={() => setExportModalOpen(true)}
              onQuickMarkClassFull={(cls) => handleReportClassFull(cls)}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {/* Thông tin người phát triển - Trang trí đẹp mắt */}
        <div className="flex items-center justify-center py-4 mt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-600 backdrop-blur-xs select-text">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Vibe Coding bởi Hùng KHTN-CN</span>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (iOS safe-area aware) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex items-center justify-around px-4 pt-2 pb-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition active:scale-95 ${
              activeTab === 'input'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            <div className={`p-1 rounded-xl mb-0.5 ${activeTab === 'input' ? 'bg-blue-100 text-blue-600' : ''}`}>
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight">Điểm danh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition active:scale-95 relative ${
              activeTab === 'list'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            <div className={`p-1 rounded-xl mb-0.5 ${activeTab === 'list' ? 'bg-blue-100 text-blue-600' : ''}`}>
              <ListFilter className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight">DS Vắng</span>
            {currentSessionAbsentees.length > 0 && (
              <span className="absolute top-1 right-[22%] bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {currentSessionAbsentees.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition active:scale-95 ${
              activeTab === 'report'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            <div className={`p-1 rounded-xl mb-0.5 ${activeTab === 'report' ? 'bg-blue-100 text-blue-600' : ''}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight">Thống kê</span>
          </button>
        </div>
      </nav>

      {/* Class Picker Bottom Sheet */}
      <ClassPickerSheet
        isOpen={classPickerOpen}
        selectedClass={selectedClass}
        onSelect={(cls) => {
          setSelectedClass(cls);
          showToast(`Đã chọn lớp ${cls}`, 'info');
        }}
        onClose={() => setClassPickerOpen(false)}
      />

      {/* Popup List Danh Sách Lớp Khi Bấm Báo Đủ */}
      <ClassPickerSheet
        isOpen={reportFullPickerOpen}
        title="🌟 Báo Cáo Đi ĐỦ Sĩ Số"
        subtitle="Chạm vào lớp để báo cáo ĐI ĐỦ ngay lập tức"
        onSelect={(cls) => {
          setReportFullPickerOpen(false);
          handleReportClassFull(cls);
        }}
        onClose={() => setReportFullPickerOpen(false)}
      />

      {/* Result Confirmation Popup */}
      <ResultModal
        isOpen={resultPopup.isOpen}
        lop={resultPopup.lop}
        records={resultPopup.records}
        onClose={() => setResultPopup({ isOpen: false, lop: '', records: [] })}
      />

      {/* Export to Excel Modal (Passcode 2026) */}
      <ExportModal
        isOpen={exportModalOpen}
        records={records}
        onClose={() => setExportModalOpen(false)}
        onSuccessToast={(msg) => showToast(msg, 'success')}
      />

      {/* Duplicate warning modal */}
      {duplicatePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl font-bold">
              ⚠️
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">
              Học Sinh Đã Báo Vắng
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Em <b>{duplicatePrompt.studentName}</b> (Lớp {duplicatePrompt.className}) đã được báo vắng buổi {selectedSession} ngày {selectedDate}.
              Bạn có muốn lưu thêm bản ghi nữa không?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDuplicatePrompt(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={duplicatePrompt.onConfirm}
                className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition"
              >
                Vẫn lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
