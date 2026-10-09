import React, { useState, useEffect, useRef } from 'react';
import { Mic, Pause, Play, Square, Sparkles, Check, Trash2, Volume2, Bot } from 'lucide-react';
import { parseAttendanceText } from '../utils/speech';
import { ParsedStudent } from '../types/attendance';

interface VoiceInputProps {
  onSaveVoiceBatch: (lop: string, students: ParsedStudent[], isFull: boolean) => void;
  selectedClass: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onSaveVoiceBatch,
  selectedClass,
}) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [pendingReview, setPendingReview] = useState<{
    lop: string;
    students: ParsedStudent[];
    isFull: boolean;
    isAiPowered?: boolean;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const accumulatedRef = useRef<string>('');
  const isManuallyStoppedRef = useRef<boolean>(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (final) {
          accumulatedRef.current += final;
        }

        const currentText = (accumulatedRef.current + ' ' + interim).trim();
        setLiveTranscript(currentText);
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech') return;
        console.warn('Voice recognition error:', e.error);
        if (e.error === 'not-allowed') {
          alert('Vui lòng cấp quyền Micro trong cài đặt trình duyệt để đọc điểm danh!');
          stopRecording();
        }
      };

      recognition.onend = () => {
        if (!isManuallyStoppedRef.current && isRecording && !isPaused) {
          try {
            recognition.start();
          } catch (err) {
            console.warn('Auto-restart recognition err:', err);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition init failed:', e);
      setIsSupported(false);
    }

    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch {}
    };
  }, [isRecording, isPaused]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói. Bạn có thể dùng ô "Gõ nhanh" rất tiện lợi!');
      return;
    }

    accumulatedRef.current = '';
    setLiveTranscript('');
    isManuallyStoppedRef.current = false;

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.warn('Start mic error:', err);
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
          setIsRecording(true);
          setIsPaused(false);
        }, 150);
      } catch {}
    }
  };

  const pauseRecording = () => {
    try {
      recognitionRef.current.stop();
    } catch {}
    setIsPaused(true);
  };

  const resumeRecording = () => {
    try {
      recognitionRef.current.start();
    } catch {}
    setIsPaused(false);
  };

  const stopRecording = async () => {
    isManuallyStoppedRef.current = true;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch {}
    setIsRecording(false);
    setIsPaused(false);

    const fullText = accumulatedRef.current.trim() || liveTranscript.trim();
    if (!fullText) {
      setLiveTranscript('');
      return;
    }

    // Call server Gemini AI to parse structured attendance
    setIsAiParsing(true);
    let resolvedClass = selectedClass || '';
    let parsedStudents: ParsedStudent[] = [];
    let isFullClass = false;
    let aiSuccess = false;

    try {
      const res = await fetch('/api/ai/parse-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, fallbackClass: selectedClass }),
      });

      if (res.ok) {
        const aiData = await res.json();
        if (aiData) {
          if (aiData.lop) resolvedClass = String(aiData.lop).toUpperCase();
          isFullClass = !!aiData.isFull;
          if (aiData.students && Array.isArray(aiData.students)) {
            parsedStudents = aiData.students.map((st: any, idx: number) => ({
              id: `ai-${Date.now()}-${idx}`,
              ten: st.ten,
              trangthai: st.trangthai === 'Có phép' ? 'Có phép' : 'Không phép',
              isExcused: st.trangthai === 'Có phép',
            }));
          }
          aiSuccess = true;
        }
      }
    } catch (err) {
      console.warn('AI parsing failed, using fast fallback parser:', err);
    } finally {
      setIsAiParsing(false);
    }

    // Fallback to local regex parser if AI didn't return students or failed
    if (!aiSuccess || (!isFullClass && parsedStudents.length === 0)) {
      const localParsed = parseAttendanceText(fullText);
      resolvedClass = localParsed.lop || selectedClass || '';
      parsedStudents = localParsed.students;
      isFullClass = localParsed.isFull;
    }

    if (!resolvedClass && !isFullClass && parsedStudents.length === 0) {
      alert('Không nhận diện được giọng nói! Thầy cô vui lòng đọc rõ hơn, ví dụ: "8A4 Tuấn p, Hoa 0p"');
      setLiveTranscript('');
      return;
    }

    setPendingReview({
      lop: resolvedClass,
      students: parsedStudents,
      isFull: isFullClass,
      isAiPowered: aiSuccess,
    });
    setLiveTranscript('');
  };

  const handleToggleStudentStatus = (index: number) => {
    if (!pendingReview) return;
    const updated = [...pendingReview.students];
    const item = updated[index];
    const newExcused = !item.isExcused;
    updated[index] = {
      ...item,
      isExcused: newExcused,
      trangthai: newExcused ? 'Có phép' : 'Không phép',
    };
    setPendingReview({ ...pendingReview, students: updated });
  };

  const handleDeleteStudent = (index: number) => {
    if (!pendingReview) return;
    const updated = pendingReview.students.filter((_, i) => i !== index);
    setPendingReview({ ...pendingReview, students: updated });
  };

  const handleConfirmSave = () => {
    if (!pendingReview) return;
    if (!pendingReview.lop) {
      alert('Vui lòng chọn hoặc điền Lớp trước khi lưu!');
      return;
    }

    onSaveVoiceBatch(pendingReview.lop, pendingReview.students, pendingReview.isFull);
    setPendingReview(null);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-4">
      <div className="text-center mb-3">
        <h2 className="text-base font-extrabold text-slate-800 text-center">
          ĐIỂM DANH BẰNG GIỌNG NÓI
        </h2>
      </div>

      {/* Visualizer bars when recording */}
      {isRecording && !isPaused && (
        <div className="flex items-center justify-center gap-1.5 h-10 mb-3">
          {[16, 28, 40, 24, 34, 18, 30].map((h, i) => (
            <div
              key={i}
              style={{
                height: `${h}px`,
                animationDelay: `${i * 0.1}s`,
              }}
              className="w-1.5 bg-gradient-to-t from-blue-600 to-sky-400 rounded-full animate-pulse transition-all duration-300"
            />
          ))}
        </div>
      )}

      {/* AI Processing Banner */}
      {isAiParsing && (
        <div className="flex items-center justify-center gap-2 py-4 px-3 mb-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 font-bold text-xs animate-pulse">
          <Bot className="w-4 h-4 animate-spin text-blue-600" />
          <span>AI Gemini đang phân tích cấu trúc điểm danh...</span>
        </div>
      )}

      {/* Primary Voice Action Buttons */}
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          disabled={isAiParsing}
          className="w-full py-4 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 active:scale-98 disabled:opacity-50 transition text-base"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <span>Bắt đầu đọc điểm danh</span>
        </button>
      ) : (
        <div className="flex gap-2">
          {!isPaused ? (
            <button
              type="button"
              onClick={pauseRecording}
              className="flex-1 py-3.5 bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition text-sm shadow-md shadow-amber-500/20"
            >
              <Pause className="w-4 h-4" />
              <span>Tạm dừng</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={resumeRecording}
              className="flex-1 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition text-sm shadow-md shadow-emerald-500/20"
            >
              <Play className="w-4 h-4" />
              <span>Đọc tiếp</span>
            </button>
          )}

          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 py-3.5 bg-rose-600 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition text-sm shadow-md shadow-rose-500/20"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Hoàn thành</span>
          </button>
        </div>
      )}

      {/* Live transcript during speech */}
      {isRecording && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed min-h-[48px] animate-in fade-in">
          <div className="font-semibold text-blue-600 mb-1 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            <span>Đang lắng nghe:</span>
          </div>
          <p className="italic text-slate-600">
            {liveTranscript || 'Thầy cô hãy đọc: "Lớp 8A4 Tuấn p, Hoa 0p" hoặc "8A4 đủ sĩ số"...'}
          </p>
        </div>
      )}

      {!isSupported && (
        <p className="text-[11px] text-amber-600 text-center mt-2 bg-amber-50 p-2 rounded-xl border border-amber-200">
          ⚠️ Trình duyệt của bạn hạn chế Web Speech. Bạn hãy dùng ô <b>Gõ nhanh</b> hoặc mở trên Google Chrome.
        </p>
      )}

      {/* INTERACTIVE REVIEW MODAL (With AI Badge) */}
      {pendingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="text-center pb-3 border-b border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl">
                🎤
              </div>
              <h3 className="text-lg font-bold text-slate-800">Xác Nhận Giọng Nói</h3>
              {pendingReview.isAiPowered ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full mt-0.5">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Đã nhận diện bằng AI Gemini
                </span>
              ) : (
                <p className="text-xs text-slate-500">Chạm vào học sinh để đổi P / 0P</p>
              )}
            </div>

            <div className="py-3 overflow-y-auto flex-1 space-y-3">
              {/* Class indicator or input */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600">Lớp nhận diện:</span>
                <input
                  type="text"
                  value={pendingReview.lop}
                  onChange={(e) => setPendingReview({ ...pendingReview, lop: e.target.value.toUpperCase() })}
                  placeholder="VD: 8A4"
                  className="w-24 text-center font-extrabold text-blue-700 bg-white border border-blue-300 rounded-xl py-1 text-sm uppercase outline-none"
                />
              </div>

              {pendingReview.isFull ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <div className="text-2xl mb-1">🎉</div>
                  <div className="text-sm font-bold text-emerald-800">Báo Cáo Đi ĐỦ Sĩ Số</div>
                  <div className="text-xs text-emerald-600">Toàn bộ học sinh lớp có mặt</div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span>Danh sách vắng ({pendingReview.students.length} em):</span>
                    <span className="text-slate-400 text-[10px]">Chạm P/0P để đổi</span>
                  </div>

                  {pendingReview.students.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400 italic">
                      Không nhận diện được tên nào. Vui lòng thử lại.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {pendingReview.students.map((st, i) => (
                        <div
                          key={st.id || i}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition"
                        >
                          <span className="text-sm font-semibold text-slate-800 truncate flex-1 pr-2">
                            {st.ten}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleStudentStatus(i)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                                st.isExcused
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {st.isExcused ? 'Có phép (P)' : 'Không phép (0P)'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(i)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
              <button
                type="button"
                onClick={() => setPendingReview(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={!pendingReview.isFull && pendingReview.students.length === 0}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 shadow-md shadow-blue-500/25 disabled:opacity-50 transition flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Lưu tất cả</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
