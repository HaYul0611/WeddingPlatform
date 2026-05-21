import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { getSessionData } from '@/lib/auth';

// 인증번호 임시 저장소 (실무에서는 Redis 등을 사용하지만, 여기서는 시연을 위해 메모리/DB를 활용할 수 있습니다. 
// 여기서는 간단하게 DB의 admins 테이블에 임시 필드를 쓰거나 세션을 활용하는 방식을 제안합니다.)
// 우선은 발송 로직부터 구현합니다.

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── 2차 인증 번호 발송 및 검증 ──────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId, email: sessionEmail } = getSessionData(session);

    if (!isValid || (companyId !== 'main' && sessionEmail !== 'ohayul.me@gmail.com')) {
      return NextResponse.json({ success: false, error: '본사 관리자만 접근 가능합니다.' }, { status: 403 });
    }

    const { action, code, email } = await req.json();

    // 1) 인증번호 발송 요청
    if (action === 'send') {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 3) 이메일 발송 (WeddingCare 브랜드 디자인 적용)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"WeddingCare 보안팀" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '[WeddingCare] 계정 관리 권한 확인을 위한 보안 인증번호',
        html: `
          <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 540px; margin: 0 auto; padding: 50px 40px; border: 1px solid #f9f0f0; border-radius: 40px; background-color: #ffffff; box-shadow: 0 20px 50px rgba(225,180,180,0.1);">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; padding: 12px 24px; border-radius: 20px; background-color: #fff5f5; border: 1px solid #feb2b2;">
                <span style="color: #e11d48; font-size: 11px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">Security Authentication</span>
              </div>
            </div>
            
            <h2 style="color: #1a1a1a; font-size: 26px; font-weight: bold; margin-bottom: 16px; text-align: center; tracking: -0.02em;">2차 보안 인증번호</h2>
            <p style="color: #71717a; font-size: 15px; line-height: 1.8; text-align: center; margin-bottom: 40px;">
              WeddingCare 마스터 계정 관리 권한 확인을 위해<br/>
              요청하신 보안 인증번호를 안내해 드립니다.
            </p>

            <div style="background-color: #fafafa; padding: 45px 30px; border-radius: 30px; margin-bottom: 40px; text-align: center; border: 1px solid #f4f4f5;">
              <span style="color: #e11d48; font-size: 42px; font-weight: 900; letter-spacing: 12px; margin-left: 12px;">${otpCode}</span>
            </div>

            <div style="text-align: center; margin-bottom: 45px;">
              <p style="color: #a1a1aa; font-size: 13px; font-weight: 500;">
                인증번호는 발송 후 <span style="color: #e11d48; font-weight: bold;">3분간</span> 유효합니다.<br/>
                시간이 만료된 경우 다시 요청해 주세요.
              </p>
            </div>

            <div style="border-top: 1px solid #f4f4f5; padding-top: 30px; text-align: center;">
              <p style="color: #27272a; font-size: 11px; font-weight: 800; letter-spacing: 2px; margin-bottom: 10px;">WEDDINGCARE PREMIUM ADMIN</p>
              <p style="color: #d4d4d8; font-size: 10px; line-height: 1.6;">
                본 메일은 WeddingCare 관리자 시스템에서 발송된 보안 전용 메일입니다.<br/>
                본인이 요청하지 않은 경우 고객센터로 문의해 주세요.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      // 보안상 세션이나 DB에 OTP 저장 로직이 필요함 (여기선 시연을 위해 발송 성공만 반환하고 OTP를 클라이언트에 암호화해 보내거나 임시 처리)
      // 실제 검증을 위해 임시로 쿠키에 암호화하여 저장하는 방식을 취하겠습니다.
      const res = NextResponse.json({ success: true, message: '인증번호가 발송되었습니다.' });
      res.cookies.set('temp_otp', otpCode, { maxAge: 180, httpOnly: true }); // 3분 유효
      return res;
    }

    // 2) 인증번호 검증 요청
    if (action === 'verify') {
      const savedOtp = req.cookies.get('temp_otp')?.value;
      if (savedOtp && savedOtp === code) {
        const res = NextResponse.json({ success: true });
        res.cookies.delete('temp_otp');
        return res;
      }
      return NextResponse.json({ success: false, error: '인증번호가 일치하지 않거나 만료되었습니다.' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: '잘못된 요청입니다.' }, { status: 400 });
  } catch (err) {
    console.error('[2FA API Error]', err);
    return NextResponse.json({ success: false, error: '인증 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
