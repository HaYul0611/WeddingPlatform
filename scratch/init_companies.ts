import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function initCompanies() {
  console.log('--- Initializing Companies Table ---');

  const sampleCompanies = [
    {
      name: '라포레 웨딩홀', category: 'wedding', region: '서울 강남',
      description: '강남 중심가에 위치한 품격 있는 호텔식 웨딩홀. 대규모 연회 가능.',
      phone: '02-555-1234', kakao_link: 'https://pf.kakao.com/_sample1',
      budget_min: 2000, budget_max: 5000, is_active: true
    },
    {
      name: '더 벨라 스튜디오', category: 'wedding', region: '서울 청담',
      description: '자연스러운 인물 중심의 웨딩 촬영 전문 스튜디오. 세련된 연출.',
      phone: '02-444-5678', kakao_link: 'https://pf.kakao.com/_sample2',
      budget_min: 150, budget_max: 300, is_active: true
    },
    {
      name: '오하나 뷰티살롱', category: 'beauty', region: '서울 도산',
      description: '신부 메이크업 전문 및 퍼스널 컬러 진단 기반의 맞춤 케어.',
      phone: '02-333-9012', kakao_link: 'https://pf.kakao.com/_sample3',
      budget_min: 50, budget_max: 120, is_active: true
    },
    {
      name: '청담 에스테틱', category: 'beauty', region: '서울 청담',
      description: '웨딩 전신 케어 및 피부 탄력 패키지. 고품격 프라이빗 룸.',
      phone: '02-222-3456', kakao_link: 'https://pf.kakao.com/_sample4',
      budget_min: 80, budget_max: 200, is_active: true
    },
    {
      name: '메디핏 필라테스', category: 'healthcare', region: '서울 잠실',
      description: '체형 교정 및 드레스 라인 관리 전문 필라테스. 1:1 레슨.',
      phone: '010-1234-5678', kakao_link: 'https://pf.kakao.com/_sample5',
      budget_min: 40, budget_max: 100, is_active: true
    },
    {
      name: '고운미 피부과', category: 'medical', region: '서울 신사',
      description: '물광 피부 시술 및 웨딩 패키지 특화 피부과. 전문의 시술.',
      phone: '02-111-7890', kakao_link: 'https://pf.kakao.com/_sample6',
      budget_min: 30, budget_max: 150, is_active: true
    },
  ];

  const { error } = await supabase.from('companies').upsert(
    sampleCompanies,
    { onConflict: 'name' }
  );

  if (error) {
    console.error('Error inserting companies:', error.message);
    if (error.message.includes('relation "companies" does not exist')) {
      console.log('\n[Action Required] Please run this SQL in Supabase SQL Editor:');
      console.log(`
          create table companies (
            id uuid default gen_random_uuid() primary key,
            name text unique not null,
            category text not null,
            phone text,
            kakao_link text,
            description text,
            region text,
            budget_min integer,
            budget_max integer,
            is_active boolean default true,
            created_at timestamp with time zone default now()
          );
        `);
    }
  } else {
    console.log('Successfully initialized companies table!');
  }
}

initCompanies();
