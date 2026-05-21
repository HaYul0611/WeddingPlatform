export default function SectionHeader({
  title,
  englishLabel,
  fontScale,
  textColor,
  align = 'center'
}: {
  title: string;
  englishLabel: string;
  fontScale: number;
  textColor?: string;
  align?: 'left' | 'center' | 'right';
}) {
  const alignClass = align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';
  const justifyClass = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  return (
    <div className={`flex flex-col gap-2 mb-10 w-full select-none ${alignClass}`}>
      {/* 1. 은은한 골드브라운 톤의 마이크로 영문 캡션 (럭셔리 웨딩 자간 0.25em 부여) */}
      <span
        className="text-[9.5px] font-black tracking-[0.25em] uppercase"
        style={{
          fontSize: `${9.5 * fontScale}px`,
          color: '#B45309', // 기본 웨딩 골드브라운 앰버 칼라
          opacity: 0.8
        }}
      >
        {englishLabel}
      </span>

      {/* 2. 기품 있고 정갈한 명조 세리프 한글 대제목 (크기 22px 완벽 동일 표준 규격화) */}
      <h3
        className="font-serif break-keep leading-tight font-semibold"
        style={{
          fontSize: `${22 * fontScale}px`,
          color: textColor || '#1C1917',
          letterSpacing: '-0.02em',
          marginTop: '2px'
        }}
      >
        {title}
      </h3>

      {/* 3. 극도의 미니멀리즘을 표현하는 초슬림 데코 가로선과 센터 닷 */}
      <div className={`flex items-center gap-2 mt-2.5 opacity-30 text-[#D97706] ${justifyClass}`}>
        <div className="w-4 h-[0.5px] bg-current" />
        <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
        <div className="w-4 h-[0.5px] bg-current" />
      </div>
    </div>
  );
}
