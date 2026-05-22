import type { InvitationTemplate, InvitationSection } from '@/types/invitation';

const GET_DEFAULT_SECTIONS = (
  templateId: string,
  groomName: string,
  brideName: string,
  date: string,
  time: string,
  venue: string,
  address: string,
  lat: number,
  lng: number,
  coverImage: string,
  // ── 12개 템플릿별로 제각각 다르게 템플릿화하기 위한 동적 매개변수 설계 ──
  galleryLayout: 'grid' | 'slideshow' | 'masonry' | 'polaroid' | 'inline' | 'carousel' = 'slideshow',
  ddayStyle: 'simple' | 'card' | 'flip' | 'typo' = 'simple',
  photoDropColumns: 2 | 3 | 4 = 3,
  introStyle: 'classic' | 'interview' | 'lovestory' = 'interview'
): InvitationSection[] => [
    // 0. cover
    {
      type: 'cover' as const,
      id: 's1',
      groom: groomName,
      bride: brideName,
      date,
      time,
      venue,
      subtitle: '두 사람이 하나가 되는 날',
      imageStyle: 'full' as const,
      image: coverImage,
      mobileImage: coverImage,
      layout: templateId as any
    },
    // 1. greeting
    {
      type: 'greeting' as const,
      id: 's2',
      title: '인사말',
      text: '서로가 서로의 곁에 있어\n행복했던 우리,\n이제 함께 걸어가려 합니다.\n\n소중한 분들을 모시고\n작은 약속을 나누고자 합니다.',
      senderName: `${groomName}·${brideName}`
    },
    // 2. gallery (첫 번째 고유 레이아웃)
    {
      type: 'gallery' as const,
      id: 's3',
      title: '갤러리',
      images: [
        { url: '/images/wedding_1.png' },
        { url: '/images/wedding_2.png' },
        { url: '/images/wedding_3.png' }
      ],
      layout: galleryLayout,
      autoPlay: true
    },
    // 3. datetime
    {
      type: 'datetime' as const,
      id: 's4',
      title: '날짜/시간',
      date,
      time,
      description: '함께 하는 첫 걸음, 그 시작의 순간에 여러분을 초대합니다.',
      style: 'editorial' as const,
      align: 'center' as const
    },
    // 4. map
    {
      type: 'map' as const,
      id: 's5',
      title: '위치/지도',
      venue,
      address,
      lat,
      lng,
      provider: 'kakao' as const,
      showCopyAddress: true,
      showNaverMap: true,
      showKakaoMap: true,
      showGoogleMap: true
    },
    // 5. bankAccount
    {
      type: 'bankAccount' as const,
      id: 's6',
      title: '계좌번호',
      displayStyle: 'accordion' as const,
      accounts: [
        { id: 'a1', ownerType: 'groom' as const, name: groomName, bank: '카카오뱅크', accountNumber: '3333-00-0000000', showKakaoPay: true, kakaoPayLink: '' },
        { id: 'a2', ownerType: 'bride' as const, name: brideName, bank: '국민은행', accountNumber: '000000-00-000000', showKakaoPay: false }
      ]
    },
    // 6. gallery (서브 그리드 레이아웃 교차 설계)
    {
      type: 'gallery' as const,
      id: 's7',
      title: '갤러리',
      images: [
        { url: '/images/wedding_1.png' },
        { url: '/images/wedding_2.png' },
        { url: '/images/wedding_3.png' },
        { url: '/images/wedding_4.png' },
        { url: '/images/wedding_5.png' },
        { url: '/images/wedding_6.png' }
      ],
      layout: (galleryLayout === 'slideshow' ? 'grid' : 'slideshow') as any,
      autoPlay: false
    },
    // 7. countdown (맞춤형 디데이 스타일링 적용)
    {
      type: 'countdown' as const,
      id: 's8',
      title: '카운트다운',
      style: ddayStyle,
      targetDate: date
    },
    // 8. photoDrop (맞춤형 컬럼 지정 및 columns number 타입 변환 에러 완벽 해결!)
    {
      type: 'photoDrop' as const,
      id: 's9',
      title: '포토 드롭',
      images: [
        { url: '/images/wedding_4.png' },
        { url: '/images/wedding_5.png' },
        { url: '/images/wedding_6.png' }
      ],
      layout: 'grid' as const,
      columns: photoDropColumns as 2 | 3 | 4,
      showCaption: false
    },
    // 9. intro
    {
      type: 'intro' as const,
      id: 's10',
      title: '신랑신부 소개',
      style: introStyle as any,
      imageShape: 'circle' as const,
      mainImage: coverImage,
      groomImage: '/images/groom_avatar.png',
      brideImage: '/images/bride_avatar.png',
      interviews: [
        { id: 'i1', question: '첫인상은 어땠나요?', groomAnswer: '눈이 크고 정말 맑았어요.', brideAnswer: '선하고 다정한 미소가 인상적이었죠.' },
        { id: 'i2', question: '서로에게 하고 싶은 말', groomAnswer: '평생 아끼고 사랑할게.', brideAnswer: '우리 언제나 행복하게 살자.' }
      ]
    },
    // 10. notice
    {
      type: 'notice' as const,
      id: 's11',
      title: '안내사항',
      displayStyle: 'accordion' as const,
      items: [
        { id: 'not_1', title: '식사 안내', description: '피로연장은 본관 2층에 마련되어 있습니다.' },
        { id: 'not_2', title: '주차 안내', description: '호텔 지하 주차장을 무료로 이용하실 수 있습니다.' }
      ]
    },
    // 11. rsvp
    {
      type: 'rsvp' as const,
      id: 's12',
      title: '참석 여부',
      deadline: date,
      allowPlusOne: true,
      displayMode: 'button' as const,
      uiStyle: 'modern' as const,
      fields: ['name', 'phone', 'attendance', 'meal', 'message'] as any
    },
    // 12. guestbook
    {
      type: 'guestbook' as const,
      id: 's13',
      title: '방명록',
      allowAnonymous: false
    }
  ];

export const invitationTemplates: InvitationTemplate[] = [
  // 1. 클래식 아치 (classic-arch)
  {
    id: 'classic-arch',
    name: '클래식 아치',
    category: 'classic',
    previewImageUrl: '/templates/classic-arch.jpg',
    tags: ['클래식', '아치', '감성'],
    theme: {
      id: 'classic-arch-theme',
      primaryColor: '#7a6655',
      accentColor: '#c9a882',
      bgColor: '#fdf8f5',
      fontFamily: 'Nanum Myeongjo',
      pattern: 'none',
      animation: 'fadeUp',
    },
    defaultSections: GET_DEFAULT_SECTIONS('classic-arch', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_1.png', 'slideshow', 'simple', 3, 'interview'),
  },
  // 2. 에디토리얼 저널 (editorial-journal)
  {
    id: 'editorial-journal',
    name: '에디토리얼 저널',
    category: 'modern',
    previewImageUrl: '/templates/editorial-journal.jpg',
    tags: ['모던', '에디토리얼', '감성'],
    theme: {
      id: 'editorial-journal-theme',
      primaryColor: '#4a3a2a',
      accentColor: '#c9a882',
      bgColor: '#f7f3ee',
      fontFamily: 'Nanum Myeongjo',
      pattern: 'none',
      animation: 'fadeIn',
    },
    defaultSections: GET_DEFAULT_SECTIONS('editorial-journal', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_2.png', 'grid', 'card', 3, 'classic'),
  },
  // 3. 매거진 감성 (magazine-torn)
  {
    id: 'magazine-torn',
    name: '매거진 감성',
    category: 'modern',
    previewImageUrl: '/templates/magazine-torn.jpg',
    tags: ['매거진', '유니크', '시크'],
    theme: {
      id: 'magazine-torn-theme',
      primaryColor: '#ffffff',
      accentColor: '#c0a090',
      bgColor: '#1a1a1a',
      fontFamily: 'Gowun Batang',
      pattern: 'none',
      animation: 'fadeIn',
    },
    defaultSections: GET_DEFAULT_SECTIONS('full', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_6.png', 'grid', 'flip', 3, 'lovestory'),
  },
  // 4. 빈티지 폴라로이드 (polaroid-vintage)
  {
    id: 'polaroid-vintage',
    name: '빈티지 폴라로이드',
    category: 'vintage',
    previewImageUrl: '/templates/polaroid-vintage.jpg',
    tags: ['빈티지', '폴라로이드', '로맨틱'],
    theme: {
      id: 'polaroid-vintage-theme',
      primaryColor: '#4a3a2a',
      accentColor: '#b09080',
      bgColor: '#ffffff',
      fontFamily: 'Nanum Myeongjo',
      pattern: 'cozyHanji',
      animation: 'fadeIn',
    },
    defaultSections: GET_DEFAULT_SECTIONS('split', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_3.png', 'polaroid', 'typo', 2, 'interview'),
  },
  // 5. 포토부스 (photobooth)
  {
    id: 'photobooth',
    name: '포토부스',
    category: 'romantic',
    previewImageUrl: '/templates/photobooth.jpg',
    tags: ['귀여운', '포토부스', '러블리'],
    theme: {
      id: 'photobooth-theme',
      primaryColor: '#c0506a',
      accentColor: '#c0506a',
      bgColor: '#fde8ef',
      fontFamily: 'Gowun Batang',
      pattern: 'none',
      animation: 'fadeUp',
    },
    defaultSections: GET_DEFAULT_SECTIONS('minimal', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_1.png', 'inline', 'card', 4, 'interview'),
  },
  // 6. 소울메이트 오벌 (soulmate-oval)
  {
    id: 'soulmate-oval',
    name: '소울메이트 오벌',
    category: 'romantic',
    previewImageUrl: '/templates/soulmate-oval.jpg',
    tags: ['로맨틱', '오벌', '소울메이트'],
    theme: {
      id: 'soulmate-oval-theme',
      primaryColor: '#5a6a7a',
      accentColor: '#7ab8e0',
      bgColor: '#ffffff',
      fontFamily: 'Gowun Batang',
      pattern: 'none',
      animation: 'fadeIn',
    },
    defaultSections: GET_DEFAULT_SECTIONS('split', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_2.png', 'slideshow', 'simple', 3, 'classic'),
  },
  // 7. 숲속의 약속 (forest-classic)
  {
    id: 'forest-classic',
    name: '숲속의 약속',
    category: 'garden',
    previewImageUrl: '/templates/forest-classic.jpg',
    tags: ['내추럴', '포레스트', '그린'],
    theme: {
      id: 'forest-classic-theme',
      primaryColor: '#6a5a4a',
      accentColor: '#c0a890',
      bgColor: '#f5f2ee',
      fontFamily: 'Nanum Myeongjo',
      pattern: 'none',
      animation: 'fadeUp',
    },
    defaultSections: GET_DEFAULT_SECTIONS('split', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_3.png', 'masonry', 'simple', 3, 'interview'),
  },
  // 8. 퓨어 심플 (bw-romantic)
  {
    id: 'bw-romantic',
    name: '퓨어 심플',
    category: 'minimal',
    previewImageUrl: '/templates/bw-romantic.jpg',
    tags: ['심플', '미니멀', '모던'],
    theme: {
      id: 'bw-romantic-theme',
      primaryColor: '#2a2a2a',
      accentColor: '#c9a882',
      bgColor: '#ffffff',
      fontFamily: 'Gowun Batang',
      pattern: 'none',
      animation: 'fadeIn',
    },
    defaultSections: GET_DEFAULT_SECTIONS('full', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_4.png', 'grid', 'typo', 3, 'classic'),
  },
  // 9. 미니멀 클래식 (golden-frame)
  {
    id: 'golden-frame',
    name: '미니멀 클래식',
    category: 'luxury',
    previewImageUrl: '/templates/golden-frame.jpg',
    tags: ['럭셔리', '골드', '프리미엄'],
    theme: {
      id: 'golden-frame-theme',
      primaryColor: '#4a3a2a',
      accentColor: '#c9a240',
      bgColor: '#ffffff',
      fontFamily: 'Noto Serif KR',
      pattern: 'none',
      animation: 'fadeIn',
    },
    defaultSections: GET_DEFAULT_SECTIONS('minimal', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_1.png', 'polaroid', 'flip', 2, 'lovestory'),
  },
  // 10. 캘리그라피 플로럴 (calligraphy-floral)
  {
    id: 'calligraphy-floral',
    name: '캘리그라피 플로럴',
    category: 'romantic',
    previewImageUrl: '/templates/calligraphy-floral.jpg',
    tags: ['플로럴', '캘리', '화사한'],
    theme: {
      id: 'calligraphy-floral-theme',
      primaryColor: '#4a3a2a',
      accentColor: '#c9a882',
      bgColor: '#fef9f5',
      fontFamily: 'Gowun Batang',
      pattern: 'botanicalWatercolor',
      animation: 'fadeUp',
    },
    defaultSections: GET_DEFAULT_SECTIONS('full', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_5.png', 'inline', 'simple', 3, 'interview'),
  },
  // 11. 미니멀 퓨어 (minimal-pure)
  {
    id: 'minimal-pure',
    name: '미니멀 퓨어',
    category: 'minimal',
    previewImageUrl: '/templates/minimal-pure.jpg',
    tags: ['미니멀', '깨끗한', '심플'],
    theme: {
      id: 'minimal-pure-theme',
      primaryColor: '#3a2a1a',
      accentColor: '#c9a882',
      bgColor: '#ffffff',
      fontFamily: 'Nanum Myeongjo',
      pattern: 'none',
      animation: 'fadeIn',
    },
    defaultSections: GET_DEFAULT_SECTIONS('full', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_6.png', 'grid', 'card', 3, 'classic'),
  },
  // 12. 파스텔 포토스트립 (pastel-photostrip)
  {
    id: 'pastel-photostrip',
    name: '파스텔 포토스트립',
    category: 'romantic',
    previewImageUrl: '/templates/pastel-photostrip.jpg',
    tags: ['파스텔', '러블리', '포토부스'],
    theme: {
      id: 'pastel-photostrip-theme',
      primaryColor: '#9a6070',
      accentColor: '#c06080',
      bgColor: '#fce8ef',
      fontFamily: 'Gowun Batang',
      pattern: 'none',
      animation: 'fadeUp',
    },
    defaultSections: GET_DEFAULT_SECTIONS('full', '오하율', '김채원', '2027-11-08', '오전 11시', '롯데 호텔 크리스탈 볼룸', '서울특별시 중구 을지로 30', 37.5658, 126.9779, '/images/wedding_1.png', 'polaroid', 'typo', 2, 'interview'),
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'modern', label: '모던' },
  { id: 'classic', label: '클래식' },
  { id: 'garden', label: '가든' },
  { id: 'minimal', label: '미니멀' },
  { id: 'romantic', label: '로맨틱' },
  { id: 'elegant', label: '엘레강스' },
  { id: 'vintage', label: '빈티지' },
  { id: 'nature', label: '내추럴' },
  { id: 'rustic', label: '러스틱' },
  { id: 'luxury', label: '럭셔리' },
] as const;
