export type WeddingStyle = 'modern' | 'classic' | 'garden' | 'minimal';
export type WeddingRegion = 'seoul' | 'gyeonggi' | 'busan' | 'daegu' | 'other';

export interface WeddingPackage {
  id: string;
  name: string;
  vendor: string;
  region: WeddingRegion;
  style: WeddingStyle;
  priceMin: number;             // 만원 단위
  priceMax: number;
  includes: string[];           // ['스튜디오', '드레스', '메이크업']
  description: string;
  tags: string[];
}
