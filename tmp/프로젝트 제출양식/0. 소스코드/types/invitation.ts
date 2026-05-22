export type SectionType =
  | 'cover'
  | 'gallery'
  | 'dday'
  | 'map'
  | 'bankAccount'
  | 'rsvp'
  | 'guestbook'
  | 'wishlist'
  | 'schedule'
  | 'greeting'
  | 'notice'
  | 'countdown'
  | 'closing'
  | 'intro'
  | 'photoDrop'
  | 'video'
  | 'contact'
  | 'text'
  | 'qrCheckin'
  | 'datetime'
  | 'timeline'
  | 'guestList';

export type AnimationEffect =
  | 'none' | 'fadeUp' | 'fadeIn' | 'slideLeft'
  | 'slideRight' | 'zoomIn' | 'blur' | 'float';

export type BackgroundPattern =
  | 'none'
  // ── Category 1. 클래식 & 전통 한지 무드 (8종) ──
  | 'cozyHanji' | 'traditionalTile' | 'palaceGrid' | 'lotusVase'
  | 'coarseHemp' | 'rainbowThread' | 'goldSilkEmb' | 'orientalInk'
  // ── Category 2. 로맨틱 & 보태니컬 플라워 (8종) ──
  | 'margaretWreath' | 'oliveGarden' | 'flowerArch' | 'roseGate'
  | 'botanicalWatercolor' | 'mistFlower' | 'lavenderBreeze' | 'vintageLeafBorder'
  // ── Category 3. 내추럴 & 오가닉 패브릭 (8종) ──
  | 'chiffonSilk' | 'rawLinen' | 'cozyFelt' | 'vintageCraft'
  | 'suedeMauve' | 'espressoWrinkle' | 'satinNavy' | 'roseVelvet'
  // ── Category 4. 미니멀 & 모던 스톤 (8종) ──
  | 'italianVein' | 'coarseSand' | 'charcoalCement' | 'antiqueGoldCrack'
  | 'blackMatteSteel' | 'pearlRock' | 'taupeMud' | 'gypsumPress'
  // ── Category 5. 유니크 & 디자인 텍스처 (8종) ──
  | 'goldGlitter' | 'seashellPearl' | 'doubleArch' | 'postalEnvelope'
  | 'filmCinema' | 'champagneGoldWave' | 'crystalDrops' | 'sweetBabyHeart';

export interface CoverSection {
  type: 'cover';
  id: string;
  groom: string;
  bride: string;
  date: string;
  time: string;
  venue: string;
  title?: string;
  subtitle?: string;
  image?: string;
  mobileImage?: string; // 모바일 배경 별도 설정
  image2?: string; // 두 번째 메인 이미지 (사진 2)
  imageStyle: 'full' | 'circle' | 'square' | 'rounded';
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
  overlayOpacity?: number; // 배경 어둡기 (0-100)
  vPosition?: number; // 텍스트 수직 위치 (0-100)
  titleSize?: number; // 타이틀 크기
  subtitleSize?: number; // 서브타이틀 크기
  dateSize?: number; // 날짜 크기
  groomSize?: number; // 신랑 이름 크기
  brideSize?: number; // 신부 이름 크기
  textColor?: string; // 텍스트 색상
  layout?: 'full' | 'split' | 'minimal' | 'classic-arch' | 'editorial-journal'; // 커버 레이아웃 추가
}

export interface GallerySection {
  type: 'gallery';
  id: string;
  title?: string;
  description?: string; // 상세 설명 추가
  images: { url: string; caption?: string }[];
  layout: 'grid' | 'slideshow' | 'masonry' | 'polaroid' | 'inline' | 'carousel'; // 타입 확장
  imageRatio?: '1:1' | '3:4' | '4:3';
  columns?: 2 | 3;
  autoPlay: boolean;
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface DdaySection {
  type: 'dday';
  id: string;
  title?: string;
  targetDate: string;
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface MapSection {
  type: 'map';
  id: string;
  title?: string;
  venue: string;
  address: string;
  detailAddress?: string; // 층, 홀 이름 등
  lat: number;
  lng: number;
  provider: 'kakao' | 'naver' | 'google';
  showMap?: boolean; // 지도 노출 여부 토글
  showCopyAddress: boolean;
  showNaverMap: boolean;
  showKakaoMap: boolean;
  showGoogleMap: boolean;
  showTMap?: boolean;
  transportation?: {
    subway?: string;
    bus?: string;
    car?: string;
    parking?: string;
  };
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface BankAccount {
  id: string;
  ownerType: 'groom' | 'bride' | 'groom_father' | 'groom_mother' | 'bride_father' | 'bride_mother' | 'other';
  relation?: string; // 관계 (예: 장남)
  name: string;
  bank: string;
  accountNumber: string;
  showKakaoPay: boolean;
  kakaoPayLink?: string;
}

export interface BankAccountSection {
  type: 'bankAccount';
  id: string;
  title?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  displayStyle: 'accordion' | 'inline' | 'modal';
  useBackgroundColor?: boolean;
  accounts: BankAccount[];
}

export interface RsvpSection {
  type: 'rsvp';
  id: string;
  title?: string;
  subtitle?: string;
  deadline: string;
  allowPlusOne: boolean;
  fields: ('name' | 'phone' | 'attendance' | 'meal' | 'message')[];
  displayMode: 'inline' | 'button' | 'popup' | 'sticky';
  uiStyle: 'modern' | 'classic' | 'minimal';
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
  fontFamily?: string;
  fontSizePercent?: number;
}

export interface GuestbookSection {
  type: 'guestbook';
  id: string;
  title?: string;
  subtitle?: string;
  maxLength?: number;
  uiStyle?: 'card' | 'list' | 'chat';
  showImage?: boolean;
  allowAnonymous?: boolean;
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
  fontFamily?: string;
  fontSizePercent?: number;
}

export interface WishlistSection {
  type: 'wishlist';
  id: string;
  title?: string;
  items: { id: string; name: string; price?: number; url?: string; reserved: boolean }[];
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface ScheduleSection {
  type: 'schedule';
  id: string;
  title?: string;
  items: { time: string; description: string }[];
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface GreetingSection {
  type: 'greeting';
  id: string;
  title?: string;
  subtitle?: string; // 부제목 추가
  text: string;
  image?: string; // 인사말 이미지 추가
  senderName?: string;
  groomParents?: string; // 신랑측 부모님 정보
  brideParents?: string; // 신부측 부모님 정보
  hosts?: {
    relation: string;
    name: string;
    phone: string;
  }[];
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right'; // 텍스트 정렬 추가
  useBackgroundColor?: boolean;
  backgroundImage?: string; // 인사말 배경 이미지
  fontSize?: number; // 글자 크기
  lineHeight?: number; // 줄 간격
  fontColor?: string; // 글자 색상
}

export interface DateTimeSection {
  type: 'datetime';
  id: string;
  title?: string;
  date: string;
  time: string;
  description?: string;
  style: 'classic' | 'calendar' | 'card' | 'typo' | 'editorial';
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  showCalendar?: boolean;
  useBackgroundColor?: boolean;
  fontFamily?: string;
  fontSizePercent?: number;
}

export interface QrCheckinSection {
  type: 'qrCheckin';
  id: string;
  title?: string;
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface NoticeSection {
  type: 'notice';
  id: string;
  title?: string;
  displayStyle: 'inline' | 'accordion' | 'slide';
  items: {
    id: string;
    title: string;
    image?: string;
    description: string;
  }[];
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
  fontFamily?: string;
  fontSizePercent?: number;
}

export interface CountdownSection {
  type: 'countdown';
  id: string;
  title?: string;
  style: 'simple' | 'card' | 'flip' | 'typo';
  targetDate: string;
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface ClosingSection {
  type: 'closing';
  id: string;
  title?: string;
  text: string;
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface IntroSection {
  type: 'intro';
  id: string;
  title?: string;
  subtitle?: string;
  style: 'classic' | 'interview' | 'lovestory';
  imageShape: 'circle' | 'rounded' | 'square';
  mainImage?: string;
  groomImage?: string;
  brideImage?: string;
  interviews: {
    id: string;
    question: string;
    groomAnswer: string;
    brideAnswer: string;
  }[];
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
  fontFamily?: string;
  fontSizePercent?: number;
  applyTitleOnly?: boolean;
}

export interface PhotoDropSection {
  type: 'photoDrop';
  id: string;
  title?: string;
  description?: string;
  images: { url: string }[];
  layout: 'grid' | 'slide';
  columns: 2 | 3 | 4;
  showCaption: boolean;
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface VideoSection {
  type: 'video';
  id: string;
  title?: string;
  videoUrl: string;
  ratio: '16:9' | '4:3' | '1:1';
  caption?: string;
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export interface ContactSection {
  type: 'contact';
  id: string;
  title?: string;
  contacts: {
    group: string;
    persons: { relation: string; name: string; phone: string }[];
  }[];
  displayStyle?: 'modal' | 'simple';
  showImage?: boolean;
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
  fontFamily?: string;
  fontSizePercent?: number;
}

export interface TextSection {
  type: 'text';
  id: string;
  title?: string;
  content: string;
  align?: 'left' | 'center' | 'right';
  useBackgroundColor?: boolean;
}

export type InvitationSection =
  | CoverSection
  | GallerySection
  | DdaySection
  | MapSection
  | BankAccountSection
  | RsvpSection
  | GuestbookSection
  | WishlistSection
  | ScheduleSection
  | GreetingSection
  | NoticeSection
  | CountdownSection
  | ClosingSection
  | IntroSection
  | PhotoDropSection
  | VideoSection
  | ContactSection
  | TextSection
  | DateTimeSection
  | QrCheckinSection
  | { type: 'timeline'; id: string; title?: string; items: any[] }
  | { type: 'guestList'; id: string; title?: string; guests: any[] };

export interface InvitationTheme {
  id: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor?: string; // Hero Text or General Text
  secondaryColor?: string;
  surfaceColor?: string;
  heroTextColor?: string;
  textSecondaryColor?: string;
  textMutedColor?: string;
  borderColor?: string;
  dividerColor?: string;
  activeColor?: string;
  fontFamily: string;
  pattern: BackgroundPattern;
  animation: AnimationEffect;
  bgmUrl?: string;
  bgmName?: string;
  bgmStartTime?: number;
  bgmEndTime?: number;
  bgmAutoPlay?: boolean;
  bgmLoop?: boolean;
  bgmVolume?: number;
  bgmCustomUrl?: string; // (deprecated)
  bgmCustomFile?: string; // 오디오 파일 Blob URL
  bgmCoverImage?: string; // 커버 이미지 Blob URL
  bgmTitle?: string; // 음악 제목
  bgmArtist?: string; // 아티스트 이름
  bgmDuration?: number; // 총 길이
  fontSize?: number; // 폰트 크기 (80-120%)
  textAlign?: 'left' | 'center' | 'right'; // 기본 정렬
  textAnimation?: 'none' | 'fadeUp' | 'fadeIn' | 'slide' | 'blur' | 'typing' | 'slideUp'; // 텍스트 애니메이션
  useTextDecoration?: boolean; // 텍스트 장식 활성화 여부
  decorationText?: string; // 장식용 텍스트 (SVG)
  sectionFrame?: 'none' | 'line' | 'shadow' | 'border' | 'round'; // 섹션 구분 스타일
  mainImageEffect?:
  | 'none' | 'cherryBlossom' | 'confetti' | 'snow' | 'lights' | 'eucalyptus' | 'bokeh' | 'bubbles'
  | 'petals' | 'sparkle' | 'hearts' | 'stars' | 'glow' | 'rain' | 'feathers' | 'butterflies' | 'rays'; // 메인 이미지 오버레이 효과 (확장)
  mainImageEffectLoop?: boolean; // 메인 이미지 효과 반복 여부
  mainImageEffectOpacity?: number; // 메인 이미지 효과 투명도 (0-100)
  imageEffect?: 'none' | 'grayscale' | 'sepia' | 'blur'; // 이미지 자체 필터 효과
  useScrollAnimation?: boolean; // 스크롤 애니메이션 사용 여부
  scrollAnimationType?: 'slide' | 'blur' | 'none'; // 스크롤 애니메이션 스타일
  useOpeningAnimation?: boolean; // 오프닝 애니메이션 사용 여부
  isBold?: boolean; // 텍스트 굵게
  isItalic?: boolean; // 텍스트 기울임
  isUnderline?: boolean; // 텍스트 밑줄
  isStrikethrough?: boolean; // 텍스트 취소선
  mobileSize?: number; // 모바일 크기
  mobileVPosition?: number; // 모바일 상하 위치
  desktopSize?: number; // 데스크톱 크기
  desktopMaxWidth?: number; // 데스크톱 최대 너비
  desktopVPosition?: number; // 데스크톱 상하 위치
  desktopHPosition?: number; // 데스크톱 좌우 위치
  sectionFrameOpacity?: number; // 섹션 프레임 투명도 (0-100)
  decorationColor?: string; // 장식용 텍스트 색상
}

export interface Invitation {
  id: string;
  templateId: string;
  slug?: string;
  theme: InvitationTheme;
  sections: InvitationSection[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface RsvpResponse {
  id: string;
  invitationId: string;
  name: string;
  phone?: string;
  attendance: 'attending' | 'notAttending' | 'undecided';
  guestCount?: number;
  meal?: string;
  message?: string;
  submittedAt: string;
}

export interface InvitationTemplate {
  id: string;
  name: string;
  category: 'modern' | 'classic' | 'minimal' | 'garden' | 'romantic' | 'elegant' | 'vintage' | 'nature' | 'rustic' | 'luxury';
  previewImageUrl: string;
  theme: InvitationTheme;
  defaultSections: InvitationSection[];
  tags: string[];
}

export type PreviewDevice = 'mobile' | 'desktop' | 'opening';
