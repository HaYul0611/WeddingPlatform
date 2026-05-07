import nodemailer from 'nodemailer';

/**
 * 실시간 알림 서비스 (Wedding Gold & Rose Premium Version)
 * - [이모지 전면 삭제] SVG 및 텍스트 기반 디자인 적용
 */

interface NotificationParams {
  name: string;
  phone: string;
  category: string;
  budget: string;
  message?: string;
  sourcePage: string;
}

const CATEGORY_MAP: Record<string, string> = {
  wedding: '웨딩 서비스',
  healthcare: '건강 / 다이어트',
  beauty: '뷰티 / 피부 관리',
  medical: '의료 / 시술 정보',
};

const BUDGET_MAP: Record<string, string> = {
  undecided: '아직 미정',
  under_500: '50만원 미만',
  '500_1000': '50만원 ~ 100만원',
  '1000_3000': '100만원 ~ 300만원',
  over_3000: '300만원 이상',
};

// ─────────────────────────────────────────────────────────────────────────
// 1. 디스코드 알림 (Antique Gold 테마) - [실제 작동 중]
// ─────────────────────────────────────────────────────────────────────────
async function sendDiscord(params: NotificationParams) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  const categoryName = CATEGORY_MAP[params.category] || params.category;
  const budgetName = BUDGET_MAP[params.budget] || params.budget;

  const embed = {
    title: '새로운 소중한 인연이 닿았습니다',
    description: '웨딩케어 전문가를 기다리는 새로운 고객님이 계십니다.',
    color: 0xD4AF37,
    fields: [
      { name: '고객 성함', value: `**${params.name}** 님`, inline: true },
      { name: '연락처', value: params.phone, inline: true },
      { name: '신청 분야', value: categoryName, inline: true },
      { name: '예상 예산', value: budgetName, inline: true },
      { name: '유입 경로', value: params.sourcePage, inline: true },
      { name: '상담 메시지', value: params.message || '(없음)' },
    ],
    footer: { text: 'WEDDINGCARE - 감동을 전하는 웨딩 파트너' },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    console.error('[Notifier] Discord Error:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 2. 이메일 알림 (Wedding Gold & Rose 스타일) - [실제 작동 중]
// ─────────────────────────────────────────────────────────────────────────
async function sendEmail(params: NotificationParams) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, '');
  const to = process.env.EMAIL_TO;

  if (!user || !pass || !to) return;

  const categoryName = CATEGORY_MAP[params.category] || params.category;
  const budgetName = BUDGET_MAP[params.budget] || params.budget;
  const now = new Date().toLocaleString('ko-KR');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const mailOptions = {
    from: `"웨딩케어" <${user}>`,
    to,
    subject: `[웨딩케어] ${params.name}님의 소중한 상담 신청이 도착했습니다`,
    html: `
      <div style="background-color: #fcf9f7; padding: 40px 10px; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(226, 98, 110, 0.08); border: 1px solid #f1e1e1;">
          <div style="background: linear-gradient(135deg, #e2626e 0%, #f7b7bb 100%); padding: 40px 30px; text-align: center; color: #fff;">
            <p style="margin: 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9; font-weight: bold;">WEDDINGCARE PREMIUM</p>
            <h1 style="margin: 15px 0 0; font-size: 24px; font-weight: normal; line-height: 1.4;">새로운 소중한 인연이<br/>닿았습니다</h1>
            <div style="width: 40px; height: 1px; background: rgba(255,255,255,0.5); margin: 25px auto;"></div>
          </div>
          <div style="padding: 40px 35px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding-bottom: 25px;"><span style="font-size: 11px; color: #d4af37; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Customer Name</span><div style="font-size: 18px; color: #333; margin-top: 5px; font-weight: 500;">${params.name} 님</div></td></tr>
              <tr><td style="padding-bottom: 25px;"><span style="font-size: 11px; color: #d4af37; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Contact info</span><div style="font-size: 16px; color: #333; margin-top: 5px;">${params.phone}</div></td></tr>
              <tr><td style="padding-bottom: 25px;"><span style="font-size: 11px; color: #d4af37; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Category</span><div style="font-size: 16px; color: #333; margin-top: 5px;">${categoryName}</div></td></tr>
              <tr><td style="padding-bottom: 25px;"><span style="font-size: 11px; color: #d4af37; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Budget</span><div style="font-size: 16px; color: #333; margin-top: 5px;">${budgetName}</div></td></tr>
              <tr><td style="padding-bottom: 25px;"><span style="font-size: 11px; color: #d4af37; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Message</span><div style="font-size: 14px; color: #666; line-height: 1.7; margin-top: 5px; background: #fafafa; padding: 15px; border-radius: 10px; border-left: 3px solid #e2626e;">${params.message || '남긴 메시지가 없습니다.'}</div></td></tr>
            </table>
            <div style="margin-top: 20px; font-size: 11px; color: #bbb; text-align: right;">접수 일시: ${now}</div>
          </div>
          <div style="background: #fdfdfd; padding: 25px; text-align: center; border-top: 1px solid #f9f9f9;"><p style="margin: 0; font-size: 11px; color: #aaa; letter-spacing: -0.2px;">본 메일은 웨딩케어 상담 관리 시스템에서 자동 발송되었습니다.</p></div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('[Notifier] Email Error:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 3. 카카오 알림톡/SMS (상용 연동부) - [실제 API 키 연결 대기 중]
// ─────────────────────────────────────────────────────────────────────────
/**
 * [상용화 가이드]
 * 실제 발송을 위해서는 솔라피(Solapi)나 알리고(Aligo) 같은 서비스의 SDK/API를 호출해야 합니다.
 * 아래 구조에 실제 API 키만 넣으면 즉시 실사용 모드로 전환됩니다.
 */
async function sendAlimtalk(params: NotificationParams) {
  console.log('[Notifier-RealReady] Kakao Alimtalk Sending to:', params.phone);

  // TODO: 실제 API 연동 예시 (솔라피 기준)
  /*
  const solapi = new SolapiMessageService("API_KEY", "API_SECRET");
  await solapi.sendOne({
    to: params.phone,
    from: "01012345678",
    text: `[웨딩케어] ${params.name}님, 상담 신청이 접수되었습니다.`
  });
  */

  await new Promise(resolve => setTimeout(resolve, 600));
  return { success: true };
}

export async function notifyNewLead(params: NotificationParams) {
  return await Promise.allSettled([
    sendDiscord(params),
    sendEmail(params),
    sendAlimtalk(params),
  ]);
}
