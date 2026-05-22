import Link from 'next/link';

const POLICY_TEXT = `
제1조 (목적)
이 약관은 (주)웨딩케어가 운영하는 웨딩 플랫폼 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "서비스"란 회사가 제공하는 웨딩 관련 정보 제공, 상담 매칭, 헬스케어 가이드 등 일체의 서비스를 말합니다.
2. "회원"이란 회사에 개인정보를 제공하여 수신 동의를 하고 서비스를 이용하는 고객을 말합니다.

제3조 (약관의 효력 및 변경)
1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.
2. 회사는 관계법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.

제4조 (서비스의 제공 및 변경)
1. 회사는 다음과 같은 업무를 수행합니다:
   - 웨딩 관련 정보 제공 및 상담 예약
   - 사용자 맞춤형 헬스케어 및 뷰티 정보 제공
   - 기타 회사가 정하는 업무

제5조 (개인정보보호)
회사는 이용자의 개인정보 수집 시 서비스 제공을 위하여 필요한 최소한의 정보를 수집합니다. 상세 내용은 '개인정보처리방침'에 따릅니다.

제6조 (관할 법원)
서비스 이용과 관련하여 발생한 분쟁에 대해 소송이 제기될 경우 회사의 소재지를 관할하는 법원을 전용 관할 법원으로 합니다.

부칙
본 약관은 2026년 5월 6일부터 적용됩니다.
`;

export default function PolicyPage() {
  return (
    <div className="bg-stone-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-800 mb-8 break-keep">이용약관</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-stone-100">
          <div className="prose prose-stone max-w-none">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600 font-sans break-keep">
              {POLICY_TEXT}
            </pre>
            <div className="mt-12 pt-6 border-t border-stone-100">
              <Link href="/" className="text-rose-500 font-semibold hover:underline">
                메인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
