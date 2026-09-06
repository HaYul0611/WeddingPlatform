# Wedding Platform — 모던 웹 기반 웨딩 서비스 플랫폼

Next.js 14와 Supabase 기반의 풀스택 웨딩 서비스 플랫폼입니다.  
웨딩 컨설팅, 모바일 청첩장, 뷰티/헬스케어 관리, CRM까지 웨딩에 필요한 서비스를 하나의 플랫폼으로 통합했습니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS 3, Lucide React (아이콘) |
| **Backend** | Supabase (BaaS) — Auth, Database, RLS |
| **UI/UX** | dnd-kit (드래그 앤 드롭), 반응형 웹 디자인 |
| **기타** | Nodemailer (메일), XLSX (엑셀 처리) |

## 주요 기능

### 웨딩 서비스
- **웨딩 컨설팅** — 상담 신청 및 관리
- **모바일 청첩장** — 드래그 앤 드롭 기반 커스텀 청첩장 제작
- **뷰티 케어** — 웨딩 뷰티 프로그램 관리
- **헬스케어** — 루틴 생성기 기반 건강 관리

### 비즈니스
- **관리자 대시보드** — 예약/상담/고객 통합 관리
- **CRM** — 리드 스코어링 기반 고객 관계 관리
- **결제** — 결제 연동 페이지
- **알림** — 이메일 기반 자동 알림 시스템

### 시스템
- **Supabase Auth** — 회원가입/로그인, 소셜 인증
- **Row Level Security** — 데이터 접근 권한 제어
- **서버/클라이언트 분리** — App Router 기반 렌더링 최적화 (SSR/CSR)

## 프로젝트 구조

```
WeddingPlatform/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 랜딩 페이지
│   ├── globals.css         # 글로벌 스타일
│   ├── wedding/            # 웨딩 서비스 페이지
│   ├── beauty/             # 뷰티 케어 페이지
│   ├── healthcare/         # 헬스케어 페이지
│   ├── consultation/       # 상담 페이지
│   ├── invite/             # 모바일 청첩장
│   ├── dashboard/          # 관리자 대시보드
│   ├── admin/              # 어드민 패널
│   ├── payment/            # 결제 페이지
│   └── api/                # API Routes
├── components/
│   ├── wedding/            # 웨딩 컴포넌트
│   ├── beauty/             # 뷰티 컴포넌트
│   ├── healthcare/         # 헬스케어 컴포넌트
│   ├── consultation/       # 상담 컴포넌트
│   ├── invite/             # 청첩장 컴포넌트
│   ├── dashboard/          # 대시보드 컴포넌트
│   ├── layout/             # 레이아웃 컴포넌트
│   └── common/             # 공통 UI 컴포넌트
├── types/                  # TypeScript 타입 정의
├── hooks/                  # 커스텀 React Hooks
├── lib/                    # Supabase 클라이언트 및 유틸리티
├── data/                   # 정적 데이터
├── supabase/               # Supabase 설정
├── scripts/                # 시드/마이그레이션 스크립트
└── package.json
```

## 실행 방법

### 사전 준비
- Node.js 18+
- Supabase 프로젝트 (URL 및 Anon Key)

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

`.env.local` 파일에 Supabase 연결 정보를 설정해야 합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
