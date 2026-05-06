/**
 * POST /api/lead
 *
 * 필요한 패키지:
 *   npm install @supabase/supabase-js nodemailer
 *   npm install -D @types/nodemailer
 *
 * 필요한 환경변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   SUPABASE_SERVICE_ROLE_KEY=     ← anon key 아님, service_role key 사용
 *   DISCORD_WEBHOOK_URL=
 *   EMAIL_USER=                    ← Gmail 주소 (예: yourname@gmail.com)
 *   EMAIL_PASS=                    ← Gmail 앱 비밀번호 (2단계 인증 후 생성)
 *   EMAIL_TO=                      ← 수신할 관리자 이메일
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// ─────────────────────────────────────────
// 타입
// ─────────────────────────────────────────
interface LeadPayload {
  id: string;
  name: string;
  phone: string;
  category: string;
  budget: string;
  message?: string;
  sourcePage: string;
  timestamp: string;
}

// ─────────────────────────────────────────
// 상수
// ─────────────────────────────────────────
const CATEGORY_LABEL: Record<string, string> = {
  wedding:    '💍 웨딩 서비스',
  beauty:     '✨ 뷰티 / 피부 관리',
  healthcare: '💪 건강 / 다이어트',
  medical:    '🏥 의료 / 시술 정보',
};

const BUDGET_LABEL: Record<string, string> = {
  undecided:   '미정',
  under_500:   '50만원 미만',
  '500_1000':  '50 ~ 100만원',
  '1000_3000': '100 ~ 300만원',
  over_3000:   '300만원 이상',
};

// ─────────────────────────────────────────
// Supabase 클라이언트 (서버 전용)
// ─────────────────────────────────────────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

// ─────────────────────────────────────────
// Discord Webhook 알림
// ─────────────────────────────────────────
async function sendDiscordAlert(lead: LeadPayload, isError?: boolean, errorMsg?: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL not set, skipping.');
    return;
  }

  const payload = isError
    ? {
        embeds: [{
          title: '🚨 상담 저장 실패',
          color: 0xE53E3E,
          fields: [
            { name: '이름',   value: lead.name,                    inline: true },
            { name: '연락처', value: lead.phone,                   inline: true },
            { name: '오류',   value: errorMsg ?? 'Unknown error',  inline: false },
          ],
          timestamp: lead.timestamp,
        }],
      }
    : {
        embeds: [{
          title: '📋 새 상담 신청',
          color: 0xE2626E,
          fields: [
            { name: '이름',      value: CATEGORY_LABEL[lead.category] ? lead.name : lead.name, inline: true },
            { name: '연락처',    value: lead.phone,                                            inline: true },
            { name: '분야',      value: CATEGORY_LABEL[lead.category] ?? lead.category,        inline: true },
            { name: '예산',      value: BUDGET_LABEL[lead.budget]     ?? lead.budget,          inline: true },
            { name: '유입 경로', value: lead.sourcePage,                                       inline: true },
            { name: '메시지',    value: lead.message?.trim() || '(없음)',                      inline: false },
          ],
          footer: { text: 'WeddingCare 상담 시스템' },
          timestamp: lead.timestamp,
        }],
      };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error('[Discord] Failed to send alert:', res.status);
  }
}

// ─────────────────────────────────────────
// Gmail SMTP 이메일 알림
// ─────────────────────────────────────────
function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <p style="margin:0;font-size:12px;color:#999;margin-bottom:2px;">${label}</p>
        <p style="margin:0;font-size:14px;color:#333;font-weight:500;">${value}</p>
      </td>
    </tr>
  `;
}

async function sendEmailAlert(lead: LeadPayload) {
  const { EMAIL_USER, EMAIL_PASS, EMAIL_TO } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
    console.warn('[Email] Email env vars not set, skipping.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  const categoryLabel = CATEGORY_LABEL[lead.category] ?? lead.category;
  const budgetLabel   = BUDGET_LABEL[lead.budget]     ?? lead.budget;
  const receivedAt    = new Date(lead.timestamp).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#E2626E;padding:28px 32px;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:1px;">WEDDINGCARE</p>
            <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:600;">새 상담 신청이 도착했습니다</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${infoRow('이름',      lead.name)}
              ${infoRow('연락처',    lead.phone)}
              ${infoRow('상담 분야', categoryLabel)}
              ${infoRow('예산',      budgetLabel)}
              ${infoRow('유입 경로', lead.sourcePage)}
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                  <p style="margin:0;font-size:12px;color:#999;margin-bottom:4px;">메시지</p>
                  <p style="margin:0;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;">${lead.message?.trim() || '(없음)'}</p>
                </td>
              </tr>
              ${infoRow('접수 시각', receivedAt)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              이 메일은 WeddingCare 상담 시스템에서 자동 발송되었습니다.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  await transporter.sendMail({
    from: `"WeddingCare 상담" <${EMAIL_USER}>`,
    to:      EMAIL_TO,
    subject: `[상담 신청] ${lead.name}님 · ${categoryLabel}`,
    html,
  });
}

// ─────────────────────────────────────────
// POST 핸들러
// ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  let lead: LeadPayload | null = null;

  try {
    const body = await req.json();
    const { id, name, phone, category, budget, message, sourcePage, timestamp } = body;

    if (!name || !phone || !category || !timestamp) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    lead = { id, name, phone, category, budget, message, sourcePage, timestamp };

    // 1) Supabase 저장
    const supabase = getSupabase();
    const { error: dbError } = await supabase.from('leads').insert([{
      id:          lead.id,
      name:        lead.name,
      phone:       lead.phone,
      category:    lead.category,
      budget:      lead.budget,
      message:     lead.message ?? '',
      source_page: lead.sourcePage,
      created_at:  lead.timestamp,
    }]);

    if (dbError) {
      console.error('[Supabase] Insert failed:', dbError.message);
      sendDiscordAlert(lead, true, dbError.message).catch(console.error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 },
      );
    }

    // 2) Discord 알림
    sendDiscordAlert(lead).catch((e) =>
      console.error('[Discord] Alert failed:', e),
    );

    // 3) 이메일 알림
    sendEmailAlert(lead).catch((e) =>
      console.error('[Email] Alert failed:', e),
    );

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Lead API] Unexpected error:', msg);
    if (lead) sendDiscordAlert(lead, true, msg).catch(console.error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
