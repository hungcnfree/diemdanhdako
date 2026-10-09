import { createClient } from '@supabase/supabase-js';
import { AttendanceRecord, StudentSuggestion } from '../types/attendance';

export const SUPABASE_URL = 'https://pziumupbvxkggcatbwrv.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_bRvrVBQSEIpGnUzFkXAixA_XzEra_UT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const DEFAULT_SCHOOL_CLASSES = [
  "6A1","6A2","6A3","6A4","6A5","6A6","6A7","6A8",
  "7A1","7A2","7A3","7A4","7A5","7A6","7A7",
  "8A1","8A2","8A3","8A4","8A5","8A6","8A7",
  "9A1","9A2","9A3","9A4","9A5","9A6","9A7","9A8"
];

const LOCAL_STORAGE_KEY = 'smart_attendance_records_cache_v8';
const LOCAL_SUGGESTIONS_KEY = 'smart_attendance_students_cache_v8';

export async function fetchRecentAttendance(days = 14): Promise<{ data: AttendanceRecord[]; error: Error | null }> {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const dateStr = fromDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('diemdanh')
      .select('*')
      .gte('ngay', dateStr)
      .order('id', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, using cache:', error);
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return { data: JSON.parse(cached), error: new Error(error.message) };
      }
      return { data: [], error: new Error(error.message) };
    }

    if (data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return { data, error: null };
    }
    return { data: [], error: null };
  } catch (err: any) {
    console.warn('Network error:', err);
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    return {
      data: cached ? JSON.parse(cached) : [],
      error: new Error(err.message || 'Lỗi kết nối'),
    };
  }
}

export async function fetchStudentSuggestions(): Promise<StudentSuggestion[]> {
  try {
    const { data, error } = await supabase
      .from('diemdanh')
      .select('lop,ten')
      .neq('ten', 'Đủ sĩ số')
      .order('id', { ascending: false })
      .limit(1000);

    const seen = new Set<string>();
    const suggestions: StudentSuggestion[] = [];

    if (!error && data) {
      for (const row of data) {
        if (!row.lop || !row.ten) continue;
        const normalizedLop = String(row.lop).trim().toUpperCase();
        const normalizedTen = String(row.ten).trim();
        const key = `${normalizedLop}|${normalizedTen.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          suggestions.push({ lop: normalizedLop, ten: normalizedTen });
        }
      }
      localStorage.setItem(LOCAL_SUGGESTIONS_KEY, JSON.stringify(suggestions));
      return suggestions;
    }
  } catch (e) {
    console.warn('Error fetching student suggestions:', e);
  }

  const cached = localStorage.getItem(LOCAL_SUGGESTIONS_KEY);
  return cached ? JSON.parse(cached) : [];
}

export async function saveAttendanceRecords(records: AttendanceRecord[]): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase.from('diemdanh').insert(records).select();
    if (error) {
      return { success: false, error: error.message };
    }

    // Update local cache
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      const currentList: AttendanceRecord[] = cached ? JSON.parse(cached) : [];
      const updated = [...(data || records), ...currentList];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Cache update error:', e);
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
  }
}

export async function deleteAttendanceRecord(id: number | string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('diemdanh').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    // Update cache
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const currentList: AttendanceRecord[] = JSON.parse(cached);
        const filtered = currentList.filter(item => String(item.id) !== String(id));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {}

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi xóa' };
  }
}

export async function updateAttendanceRecord(
  id: number | string,
  updates: Partial<AttendanceRecord>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('diemdanh').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi cập nhật' };
  }
}
