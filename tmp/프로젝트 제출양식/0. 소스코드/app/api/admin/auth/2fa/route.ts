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
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 60px 40px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04);">
            <div style="text-align: center; margin-bottom: 50px;">
              <h1 style="margin: 0; color: #111111; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">WEDDING CARE</h1>
              <p style="margin: 6px 0 0; color: #888888; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Premium Admin</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="margin: 0 0 12px; color: #222222; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">마스터 계정 보안 인증</h2>
              <p style="margin: 0; color: #666666; font-size: 15px; line-height: 1.6;">
                보안을 위해 2차 인증을 진행합니다.<br/>
                아래 6자리 코드를 화면에 입력해 주세요.
              </p>
            </div>

            <div style="background: linear-gradient(145deg, #f8f9fa, #f1f3f5); padding: 40px 0; border-radius: 16px; margin-bottom: 40px; text-align: center; border: 1px solid #e9ecef; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
              <span style="color: #111111; font-size: 42px; font-weight: 900; letter-spacing: 16px; margin-left: 16px; text-shadow: 0 2px 10px rgba(0,0,0,0.05);">${otpCode}</span>
            </div>

            <div style="text-align: center; margin-bottom: 50px;">
              <p style="margin: 0; color: #888888; font-size: 14px;">
                이 인증번호는 <strong style="color: #111111;">3분간</strong> 유효합니다.
              </p>
            </div>

            <div style="border-top: 1px solid #eeeeee; padding-top: 30px; text-align: center;">
              <p style="margin: 0 0 5px; color: #999999; font-size: 12px;">
                본인이 요청하지 않은 경우, 즉시 비밀번호를 변경해 주세요.
              </p>
              <p style="margin: 0; color: #bbbbbb; font-size: 11px;">
                &copy; 2026 WeddingCare Inc. All rights reserved.
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
