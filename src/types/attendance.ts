export interface AttendanceRecord {
  id?: number | string;
  ngay: string; // YYYY-MM-DD
  buoi: 'Sáng' | 'Chiều';
  lop: string;
  ten: string;
  trangthai: 'Có phép' | 'Không phép' | 'Đủ';
  created_at?: string;
}

export interface StudentSuggestion {
  lop: string;
  ten: string;
}

export interface ParsedStudent {
  id: string;
  ten: string;
  trangthai: 'Có phép' | 'Không phép' | 'Đủ';
  isExcused: boolean;
}

export interface VoiceParseResult {
  lop: string | null;
  students: ParsedStudent[];
  isFull: boolean;
  countP: number;
  countKP: number;
  countTotal: number;
  rawText: string;
}
