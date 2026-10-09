export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatVietnameseDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

export function getVietnameseGreeting(): string {
  const h = new Date().getHours();
  const morningGreetings = [
    "🌅 Chào buổi sáng! Chúc thầy cô ngày mới an lành và tràn đầy năng lượng!",
    "☀️ Buổi sáng tốt lành! Chúc thầy cô ngày giảng dạy vui vẻ, thuận lợi!",
    "🌻 Chúc thầy cô một ngày làm việc hiệu quả và nhiều niềm vui!"
  ];
  const afternoonGreetings = [
    "🌤️ Chào buổi chiều! Chúc thầy cô buổi giảng dạy hứng khởi!",
    "☕ Buổi chiều an nhiên, chúc thầy cô mọi việc suôn sẻ!",
    "🌸 Chúc quý thầy cô một buổi chiều làm việc nhẹ nhàng, hiệu quả!"
  ];
  const eveningGreetings = [
    "🌆 Chào buổi tối! Chúc thầy cô nghỉ ngơi ấm áp bên gia đình!",
    "🌙 Buổi tối an lành, chúc thầy cô thư giãn và ngủ ngon!",
    "✨ Chúc thầy cô buổi tối bình yên sau một ngày cống hiến!"
  ];

  let list = morningGreetings;
  if (h >= 12 && h < 18) list = afternoonGreetings;
  else if (h >= 18 || h < 5) list = eveningGreetings;

  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

export function getCurrentSession(): 'Sáng' | 'Chiều' {
  const hour = new Date().getHours();
  return hour >= 12 ? 'Chiều' : 'Sáng';
}

export function getShortTeacherWish(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) {
    return "Chúc thầy cô ngày mới vui vẻ & tràn đầy năng lượng! 🌻";
  } else if (h >= 12 && h < 18) {
    return "Chúc thầy cô buổi chiều làm việc vui vẻ, thuận lợi! 🌸";
  } else {
    return "Chúc thầy cô buổi tối bình an và ấm áp bên gia đình! ✨";
  }
}

export function formatFullTeacherTime(dateStr: string, session: 'Sáng' | 'Chiều'): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return `${session}/${dateStr}`;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const thu = dayNames[d.getDay()];
  const ngay = String(parts[2]).padStart(2, '0');
  const thang = String(parts[1]).padStart(2, '0');
  const nam2So = parts[0].slice(-2);
  return `${session} / ${thu} / ${ngay}/${thang}/${nam2So}`;
}
