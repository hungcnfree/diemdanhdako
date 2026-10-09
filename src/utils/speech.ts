import { ParsedStudent, VoiceParseResult } from '../types/attendance';

// Word-to-number dictionary for Vietnamese voice recognition & informal text
const WORD_TO_DIGIT: Record<string, string> = {
  'một': '1', 'mot': '1', 'mốt': '1',
  'hai': '2',
  'ba': '3',
  'bốn': '4', 'bon': '4', 'tư': '4', 'tu': '4',
  'năm': '5', 'nam': '5', 'lăm': '5',
  'sáu': '6', 'sau': '6',
  'bảy': '7', 'bay': '7', 'bẩy': '7',
  'tám': '8', 'tam': '8',
  'chín': '9', 'chin': '9',
  'mười': '10', 'muoi': '10',
};

export function normalizeVietnameseSpeech(text: string): string {
  let res = text.toLowerCase().trim();

  // Replace spoken grade & class numbers: e.g. "lớp sáu a bốn" -> "lớp 6 a 4"
  for (const [word, digit] of Object.entries(WORD_TO_DIGIT)) {
    const reg = new RegExp(`\\b${word}\\b`, 'g');
    res = res.replace(reg, digit);
  }

  // Normalize "a 1" -> "a1", "a 4" -> "a4"
  res = res.replace(/\b([6-9]|10)\s*a\s*(\d{1,2})\b/gi, '$1A$2');
  res = res.replace(/\blớp\s*([6-9]|10)\s*(\d{1,2})\b/gi, '$1A$2');
  res = res.replace(/\blớp\s*([6-9]|10)\s*a\s*(\d{1,2})\b/gi, '$1A$2');
  res = res.replace(/\b([6-9]|10)[\/\.\-](\d{1,2})\b/g, '$1A$2');

  return res;
}

export function capitalizeWords(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// All keywords for "Có phép" (P)
const EXCUSED_KEYWORDS = [
  'có phép', 'co phep', 'có phep', 'co phép',
  'phép', 'phep', 'cóp', 'cop', 'cp',
  'c/p', '(p)', '(cp)', 'pê', 'pé', 'p'
];

// All keywords for "Không phép" (KP / 0P)
const UNEXCUSED_KEYWORDS = [
  'không phép', 'khong phep', 'ko phep', 'k phep',
  'không', 'khong', 'k/p', '(kp)', '(0p)', '(k)', '(0)',
  '0p', 'op', 'kp', 'ko', 'k', 'o', '0'
];

export function isExcusedStatus(statusStr: string): boolean {
  const s = statusStr.toLowerCase().trim().replace(/[()\/]/g, '');
  if (s === 'p' || s === 'cp' || s === 'pê' || s === 'pé') return true;
  if (s === '0p' || s === 'op' || s === 'kp' || s === 'k' || s === 'ko' || s === '0' || s === 'o') return false;
  return EXCUSED_KEYWORDS.includes(s) || s.includes('có phép') || s.includes('co phep');
}

export function parseAttendanceText(raw: string): VoiceParseResult {
  const emptyResult: VoiceParseResult = {
    lop: null,
    students: [],
    isFull: false,
    countP: 0,
    countKP: 0,
    countTotal: 0,
    rawText: raw || '',
  };

  if (!raw || !raw.trim()) {
    return emptyResult;
  }

  let text = normalizeVietnameseSpeech(raw);

  // 1. Detect Class (e.g. 8A4, 6A1, 9A7, 7A3, 8A10, 8-4, 8/4, 8.4)
  let detectedClass: string | null = null;
  const classRegex = /(?:lớp\s*|lop\s*)?([6-9]|10)\s*[aA]\s*(\d{1,2})/i;
  const matchClass = text.match(classRegex);

  let remaining = text;
  if (matchClass) {
    const grade = matchClass[1];
    const section = matchClass[2];
    detectedClass = `${grade}A${section}`.toUpperCase();
    remaining = text.replace(matchClass[0], ' ').trim();
  } else {
    // Check fallback pattern: e.g. "8-4" or "8a4"
    const simpleMatch = text.match(/\b([6-9]|10)[aA](\d{1,2})\b/);
    if (simpleMatch) {
      detectedClass = simpleMatch[0].toUpperCase();
      remaining = text.replace(simpleMatch[0], ' ').trim();
    }
  }

  // Clean trailing punctuation from class removal (e.g. "8A4: " or "8A4 -")
  remaining = remaining.replace(/^[:\-\–\—\s,]+/, '').trim();

  // 2. Detect "Đủ sĩ số" or "Đi đủ"
  const isFullClass =
    /\b(đủ sĩ số|du si so|đi đủ|di du|đủ|du|tất cả có mặt|sĩ số đủ|0 vắng|không vắng)\b/i.test(remaining) &&
    !/(không phép|có phép|\b(0p|kp|cp|p|k)\b)/i.test(remaining);

  if (isFullClass) {
    return {
      lop: detectedClass,
      students: [
        {
          id: 'full-1',
          ten: 'Đủ sĩ số',
          trangthai: 'Đủ',
          isExcused: true,
        },
      ],
      isFull: true,
      countP: 0,
      countKP: 0,
      countTotal: 0,
      rawText: raw,
    };
  }

  // 3. Split remaining string into segments by separators
  // Delimiters: comma, semicolon, newline, "và", "với", "rồi", "&"
  let segments = remaining
    .split(/[,;\n\r]|\s+và\s+|\s+với\s+|\s+rồi\s+|\s+&\s+/i)
    .map(s => s.trim())
    .filter(Boolean);

  // 4. If there's only 1 segment or no commas, but multiple students with status tags:
  // e.g. "nam p hung 0p hoa kp" or "an p binh 0p"
  if (segments.length <= 1) {
    // Status token regex matching (P, 0P, KP, CP, etc.)
    const statusPattern = '(?:có\\s*phép|không\\s*phép|co\\s*phep|khong\\s*phep|0p|op|kp|cp|pê|pé|\\(p\\)|\\(0p\\)|\\(kp\\)|\\bp\\b|\\bkp\\b|\\b0p\\b|\\bcp\\b|\\bk\\b|\\b0\\b)';
    const regex = new RegExp(`\\s*(${statusPattern})(?=\\s+|$|[;,])`, 'gi');

    const matches: { start: number; end: number; status: string }[] = [];
    let m;
    while ((m = regex.exec(remaining)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        status: m[1],
      });
    }

    if (matches.length > 0) {
      const extracted: string[] = [];
      let lastIndex = 0;
      for (const mt of matches) {
        const studentName = remaining.substring(lastIndex, mt.start).trim();
        if (studentName) {
          extracted.push(`${studentName} ${mt.status}`);
        }
        lastIndex = mt.end;
      }
      if (extracted.length > 0) {
        segments = extracted;
      }
    }
  }

  // 5. Parse each student segment
  const students: ParsedStudent[] = [];
  const statusTokens = [...EXCUSED_KEYWORDS, ...UNEXCUSED_KEYWORDS].sort((a, b) => b.length - a.length);
  const statusTokensRegex = new RegExp(`\\s+(${statusTokens.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i');

  for (let idx = 0; idx < segments.length; idx++) {
    let segment = segments[idx].trim();
    if (!segment) continue;

    // Remove numbering or bullets at start (e.g. "1.", "2)", "1/", "- ", "• ")
    segment = segment.replace(/^(\d+[\.\)\/\-]?\s*|[\-\+•\*]\s*)/i, '').trim();

    const statusMatch = segment.match(statusTokensRegex);
    let name = segment;
    let isExcused = false;

    if (statusMatch) {
      const matchedStatus = statusMatch[1].trim();
      isExcused = isExcusedStatus(matchedStatus);
      name = segment.substring(0, segment.length - statusMatch[0].length).trim();
    } else {
      // Check if status is a single word at the end (e.g. "p", "0p", "kp", "k", "0")
      const words = segment.split(/\s+/);
      const lastWord = words[words.length - 1]?.toLowerCase();
      if (lastWord && (lastWord === 'p' || lastWord === '0p' || lastWord === 'kp' || lastWord === 'cp' || lastWord === 'k' || lastWord === '0' || lastWord === 'op')) {
        isExcused = isExcusedStatus(lastWord);
        name = words.slice(0, -1).join(' ').trim();
      }
    }

    // Clean up student name prefix words (e.g. "em", "hs", "hs1", "bạn", "học sinh")
    name = name
      .replace(/^(?:hs\s*\d*|em|bạn|học\s*sinh)\s+/i, '')
      .replace(/^[:\-\–\—\s,]+/, '')
      .replace(/[:\-\–\—\s,]+$/, '')
      .trim();

    if (name) {
      students.push({
        id: `st-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        ten: capitalizeWords(name),
        trangthai: isExcused ? 'Có phép' : 'Không phép',
        isExcused,
      });
    }
  }

  const countP = students.filter(s => s.isExcused).length;
  const countKP = students.filter(s => !s.isExcused && s.trangthai !== 'Đủ').length;
  const countTotal = students.filter(s => s.trangthai !== 'Đủ').length;

  return {
    lop: detectedClass,
    students,
    isFull: false,
    countP,
    countKP,
    countTotal,
    rawText: raw,
  };
}
