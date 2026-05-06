import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="bg-stone-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-800 mb-8 break-keep">개인정보처리방침</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-stone-100">
          <div className="prose prose-stone max-w-none">
            <p className="text-sm leading-relaxed text-stone-600 break-keep">
              (주)웨딩케어는 고객님의 개인정보를 소중하게 생각하며, '개인정보 보호법' 등 관련 법령을 준수하고 있습니다.
              본 방침은 당사가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 등을 안내해 드립니다.
            </p>

            <h3 className="text-lg font-semibold text-stone-800 mt-8 mb-4 break-keep">1. 수집하는 개인정보 항목</h3>
            <p className="text-sm leading-relaxed text-stone-600 break-keep">
              - 필수항목: 이름, 연락처(휴대폰 번호), 상담 분야, 예산 범위<br />
              - 선택항목: 결혼 예정일, 기타 문의사항
            </p>

            <h3 className="text-lg font-semibold text-stone-800 mt-8 mb-4 break-keep">2. 수집 및 이용 목적</h3>
            <p className="text-sm leading-relaxed text-stone-600 break-keep">
              - 웨딩 상담 서비스 제공 및 관련 정보 안내<br />
              - 제휴 업체 매칭 및 견적 정보 전달<br />
              - 고객 불만 처리 및 고객 서비스 품질 개선
            </p>

            <h3 className="text-lg font-semibold text-stone-800 mt-8 mb-4 break-keep">3. 보유 및 이용 기간</h3>
            <p className="text-sm leading-relaxed text-stone-600 break-keep">
              - 수집된 개인정보는 원칙적으로 목적 달성 후 지체 없이 파기합니다.<br />
              - 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다. (상담 기록: 3년)
            </p>

            <h3 className="text-lg font-semibold text-stone-800 mt-8 mb-4 break-keep">4. 파기 절차 및 방법</h3>
            <p className="text-sm leading-relaxed text-stone-600 break-keep">
              - 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.<br />
              - 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
            </p>

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
