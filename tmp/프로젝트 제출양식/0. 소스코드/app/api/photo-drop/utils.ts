// 악성 댓글 필터링을 위한 기본 금칙어 (예시)
const BANNED_WORDS = [
  '바보', '멍청이', '쓰레기', '씨발', '개새끼', '존나', '지랄', '병신', '호구', '창녀', '미친'
];

export function containsBadWords(text: string): boolean {
  if (!text) return false;
  return BANNED_WORDS.some(word => text.includes(word));
}
