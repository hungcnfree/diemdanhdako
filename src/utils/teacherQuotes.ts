export interface TeacherQuote {
  id: number;
  type: 'chuc' | 'dong_vien';
  tag: string;
  badge: string;
  content: string;
}

export const TEACHER_WISHES: TeacherQuote[] = [
  { id: 1, type: 'chuc', tag: 'Lời Chúc', badge: '🌸', content: 'Chúc thầy cô một ngày giảng dạy thăng hoa và tràn ngập niềm vui!' },
  { id: 2, type: 'chuc', tag: 'Lời Chúc', badge: '☀️', content: 'Chúc thầy cô luôn dồi dào sức khỏe và giữ mãi ngọn lửa đam mê với nghề!' },
  { id: 3, type: 'chuc', tag: 'Lời Chúc', badge: '🌻', content: 'Chúc mỗi tiết học của thầy cô đều ngập tràn nụ cười và sự hào hứng của học trò!' },
  { id: 4, type: 'chuc', tag: 'Lời Chúc', badge: '✨', content: 'Chúc thầy cô luôn tươi trẻ, bình an và hạnh phúc bên gia đình và đàn em thơ!' },
  { id: 5, type: 'chuc', tag: 'Lời Chúc', badge: '💐', content: 'Chúc thầy cô gặt hái thật nhiều quả ngọt trong sự nghiệp trồng người cao quý!' },
  { id: 6, type: 'chuc', tag: 'Lời Chúc', badge: '🕊️', content: 'Chúc thầy cô có một ngày làm việc nhẹ nhàng, tâm hồn luôn thư thái và an yên!' },
  { id: 7, type: 'chuc', tag: 'Lời Chúc', badge: '🌈', content: 'Chúc lớp học của thầy cô hôm nay thật ngoan, tiếp thu bài thật nhanh và hiệu quả!' },
  { id: 8, type: 'chuc', tag: 'Lời Chúc', badge: '🍀', content: 'Chúc thầy cô luôn gặp nhiều may mắn, thuận lợi trong công tác và cuộc sống!' },
  { id: 9, type: 'chuc', tag: 'Lời Chúc', badge: '🌟', content: 'Chúc thầy cô một buổi dạy tràn đầy năng lượng tích cực và cảm hứng!' },
  { id: 10, type: 'chuc', tag: 'Lời Chúc', badge: '☕', content: 'Chúc thầy cô có những phút giây giải lao thật thư thái và ấm áp bên đồng nghiệp!' },
  { id: 11, type: 'chuc', tag: 'Lời Chúc', badge: '🍎', content: 'Chúc sự nhiệt huyết của thầy cô luôn thắp sáng ước mơ cho bao thế hệ học sinh!' },
  { id: 12, type: 'chuc', tag: 'Lời Chúc', badge: '📚', content: 'Chúc thầy cô luôn tìm thấy niềm say mê mới trong từng trang giáo án!' },
  { id: 13, type: 'chuc', tag: 'Lời Chúc', badge: '🌿', content: 'Chúc tinh thần thầy cô luôn sảng khoái, thanh thản sau mỗi giờ lên lớp!' },
  { id: 14, type: 'chuc', tag: 'Lời Chúc', badge: '💖', content: 'Chúc tình yêu nghề của thầy cô luôn được đền đáp bằng sự kính trọng của học trò!' },
  { id: 15, type: 'chuc', tag: 'Lời Chúc', badge: '🎉', content: 'Chúc thầy cô hôm nay đón nhận thật nhiều tin vui từ các em học sinh thân yêu!' },
  { id: 16, type: 'chuc', tag: 'Lời Chúc', badge: '🌺', content: 'Chúc thầy cô luôn có một trái tim bao dung, nhẫn nại và ấm áp như người cha, người mẹ thứ hai!' },
  { id: 17, type: 'chuc', tag: 'Lời Chúc', badge: '🌱', content: 'Chúc những hạt mầm tri thức thầy cô gieo hôm nay sẽ sớm đơm hoa kết trái ngọt ngào!' },
  { id: 18, type: 'chuc', tag: 'Lời Chúc', badge: '💎', content: 'Chúc ngọn đèn trí tuệ của thầy cô mãi soi sáng con đường tương lai của học sinh!' },
  { id: 19, type: 'chuc', tag: 'Lời Chúc', badge: '🎵', content: 'Chúc mỗi ngày đến trường của thầy cô là một ngày vui rộn ràng tiếng cười!' },
  { id: 20, type: 'chuc', tag: 'Lời Chúc', badge: '🎨', content: 'Chúc thầy cô vẽ nên thật nhiều chân trời tri thức tươi sáng cho thế hệ mai sau!' },
  { id: 21, type: 'chuc', tag: 'Lời Chúc', badge: '🏆', content: 'Chúc thầy cô đạt được mọi mục tiêu giảng dạy đã đề ra trong tuần này!' },
  { id: 22, type: 'chuc', tag: 'Lời Chúc', badge: '🌤️', content: 'Chúc một buổi chiều dịu mát, chúc công việc của thầy cô xuôi chèo mát mái!' },
  { id: 23, type: 'chuc', tag: 'Lời Chúc', badge: '🎁', content: 'Chúc thầy cô luôn nhận được sự tin yêu trọn vẹn từ phụ huynh và học sinh!' },
  { id: 24, type: 'chuc', tag: 'Lời Chúc', badge: '🎈', content: 'Chúc thầy cô luôn giữ được nụ cười hiền hậu, xua tan mọi mệt mỏi âu lo!' },
  { id: 25, type: 'chuc', tag: 'Lời Chúc', badge: '💡', content: 'Chúc thầy cô luôn có nhiều ý tưởng sáng tạo độc đáo để bài giảng thêm hấp dẫn!' },
  { id: 26, type: 'chuc', tag: 'Lời Chúc', badge: '🌙', content: 'Chúc thầy cô buổi tối trọn vẹn bình yên, ngủ thật ngon giấc để nạp đầy năng lượng!' },
  { id: 27, type: 'chuc', tag: 'Lời Chúc', badge: '🌷', content: 'Chúc thầy cô luôn vững vàng tay chèo, đưa bao thế hệ học trò cập bến vinh quang!' },
  { id: 28, type: 'chuc', tag: 'Lời Chúc', badge: '🕊️', content: 'Chúc tâm hồn người thầy luôn bình yên và trong sáng như chính nghề bụi phấn!' },
  { id: 29, type: 'chuc', tag: 'Lời Chúc', badge: '🍯', content: 'Chúc những năm tháng đứng trên bục giảng luôn là những kỷ niệm ngọt ngào nhất!' },
  { id: 30, type: 'chuc', tag: 'Lời Chúc', badge: '🌟', content: 'Chúc thầy cô một ngày thật tuyệt vời, làm việc hiệu quả và luôn ngập tràn may mắn!' },
];

export const TEACHER_ENCOURAGEMENTS: TeacherQuote[] = [
  { id: 31, type: 'dong_vien', tag: 'Lời Động Viên', badge: '👏', content: 'Thầy cô đã làm rất tuyệt vời! Cảm ơn sự chu đáo và trách nhiệm của thầy cô!' },
  { id: 32, type: 'dong_vien', tag: 'Lời Động Viên', badge: '❤️', content: 'Nghề giáo tuy vất vả nhưng vô cùng vinh quang. Từng nỗ lực của thầy cô đều có ý nghĩa to lớn!' },
  { id: 33, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🌟', content: 'Mỗi ngày thầy cô bước lên bục giảng là đang thắp sáng tương lai cho một đứa trẻ!' },
  { id: 34, type: 'dong_vien', tag: 'Lời Động Viên', badge: '💪', content: 'Cố lên thầy cô nhé! Tình yêu thương của thầy cô sẽ biến đổi cuộc đời của học sinh!' },
  { id: 35, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🏆', content: 'Thầy cô là người anh hùng thầm lặng gieo mầm tri thức và đạo làm người cho thế hệ trẻ!' },
  { id: 36, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🪴', content: 'Cây tri thức cần thời gian lớn lên, và tình cảm tận tụy của thầy cô chính là nguồn dinh dưỡng quý giá nhất!' },
  { id: 37, type: 'dong_vien', tag: 'Lời Động Viên', badge: '⭐', content: 'Cảm ơn thầy cô vì đã không ngừng kiên nhẫn và bao dung với từng cô cậu học trò!' },
  { id: 38, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🎖️', content: 'Điểm danh xong rồi! Thầy cô nhớ dành ít phút uống nước và thư giãn trước giờ dạy nhé!' },
  { id: 39, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🕯️', content: 'Nghề giáo như ngọn nến soi đường, sự cống hiến của thầy cô luôn được trân trọng và ghi nhớ!' },
  { id: 40, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🚀', content: 'Không có nghề nào nâng bước ước mơ bay xa bằng nghề của quý thầy cô!' },
  { id: 41, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🥇', content: 'Thầy cô đang làm một việc vô cùng vĩ đại: định hình nhân cách và tương lai của đất nước!' },
  { id: 42, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🙌', content: 'Dù đôi lúc học trò nghịch ngợm, nhưng tình cảm chân thành của thầy cô sẽ chạm tới trái tim các em!' },
  { id: 43, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🌼', content: 'Hãy mỉm cười tự hào vì hôm nay thầy cô lại trao đi thêm nhiều tri thức quý giá!' },
  { id: 44, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🌤️', content: 'Mỗi khó khăn hôm nay sẽ là niềm tự hào khi nhìn thấy học trò khôn lớn ngày mai!' },
  { id: 45, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🏅', content: 'Sự kiên trì của thầy cô chính là tấm gương sáng nhất mà học sinh học theo mỗi ngày!' },
  { id: 46, type: 'dong_vien', tag: 'Lời Động Viên', badge: '💖', content: 'Hạnh phúc của người thầy là thấy học trò tiến bộ từng ngày. Thầy cô đang làm rất tốt!' },
  { id: 47, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🕊️', content: 'Gác lại âu lo bên ngoài cửa lớp, chúc thầy cô tìm thấy niềm vui thuần khiết bên bục giảng!' },
  { id: 48, type: 'dong_vien', tag: 'Lời Động Viên', badge: '☕', content: 'Nghỉ ngơi một chút thầy cô nhé, sức khỏe và nụ cười của thầy cô là món quà lớn nhất cho học trò!' },
  { id: 49, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🌈', content: 'Những bài học hôm nay sẽ nâng cánh ước mơ cho các em bay đến muôn phương mai sau!' },
  { id: 50, type: 'dong_vien', tag: 'Lời Động Viên', badge: '💎', content: 'Bụi phấn có thể làm bạc tóc, nhưng tình yêu nghề của thầy cô luôn sáng mãi với thời gian!' },
  { id: 51, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🎯', content: 'Một ngày làm việc hiệu quả bắt đầu từ việc điểm danh chu đáo. Thầy cô thật tuyệt vời!' },
  { id: 52, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🌻', content: 'Mỗi lời khen ngợi của thầy cô hôm nay có thể thay đổi cả cuộc đời của một học sinh!' },
  { id: 53, type: 'dong_vien', tag: 'Lời Động Viên', badge: '⚓', content: 'Người lái đò cần mẫn đưa khách sang sông, công lao của thầy cô thật đáng trân quý vô ngần!' },
  { id: 54, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🌟', content: 'Cảm ơn thầy cô vì đã luôn đến lớp với nụ cười ấm áp và trái tim tận tụy!' },
  { id: 55, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🍀', content: 'Dù phía trước còn nhiều thử thách, hãy nhớ rằng thầy cô luôn là thần tượng trong lòng học trò!' },
  { id: 56, type: 'dong_vien', tag: 'Lời Động Viên', badge: '📚', content: 'Mỗi chữ thầy cô dạy, mỗi bài học thầy cô trao đều là hành trang vô giá cho các em!' },
  { id: 57, type: 'dong_vien', tag: 'Lời Động Viên', badge: '✨', content: 'Tuyệt vời lắm thầy cô ơi! Chúc một buổi dạy thật tràn đầy hứng khởi và niềm vui!' },
  { id: 58, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🌿', content: 'Gieo hạt nhân ái, ươm mầm ước mơ — sự cống hiến của thầy cô luôn âm thầm mà rực rỡ!' },
  { id: 59, type: 'dong_vien', tag: 'Lời Động Viên', badge: '🎊', content: 'Nhiệm vụ điểm danh đã hoàn tất xuất sắc! Chúc thầy cô có một ngày dạy học thật viên mãn!' },
  { id: 60, type: 'dong_vien', tag: 'Lời Động Viên', badge: '👑', content: 'Thầy cô chính là người truyền cảm hứng vĩ đại nhất. Cảm ơn thầy cô vì tất cả!' },
];

export const ALL_TEACHER_QUOTES: TeacherQuote[] = [
  ...TEACHER_WISHES,
  ...TEACHER_ENCOURAGEMENTS,
];

export function getRandomTeacherRewardQuote(): TeacherQuote {
  const index = Math.floor(Math.random() * ALL_TEACHER_QUOTES.length);
  return ALL_TEACHER_QUOTES[index];
}
