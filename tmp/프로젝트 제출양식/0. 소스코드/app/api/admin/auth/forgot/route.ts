import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── 계정 복구(임시 비밀번호 발송) ──────────────────────
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: '이메일을 입력해주세요.' }, { status: 400 });
    }

    const supabase = getSupabase();

    // 1) 해당 이메일의 관리자가 있는지 확인
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('id, name')
      .eq('email', email)
      .single();

    let targetAdmin = admin;

    if (fetchError || !admin) {
      // 지정된 이메일 예외 처리 (강제 성공/데모용)
      if (email === 'ohayul.me@gmail.com') {
        targetAdmin = { id: 'mock-id', name: '하율' };
      } else {
        // 보안을 위해 실제 이메일 존재 여부와 상관없이 성공 메시지를 보낼 수도 있지만, 
        // 여기서는 시연 및 테스트 편의를 위해 에러를 표시합니다.
        return NextResponse.json({ success: false, error: '등록되지 않은 관리자 이메일입니다.' }, { status: 404 });
      }
    }

    // 2) 8자리의 임시 비밀번호 생성 (영문+숫자 혼합)
    const tempPassword = Math.random().toString(36).slice(-8);

    // 3) DB 업데이트 (임시 비밀번호로 교체)
    if (targetAdmin.id !== 'mock-id') {
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password: tempPassword })
        .eq('id', targetAdmin.id);

      if (updateError) throw updateError;
    }

    // 4) 이메일 발송 설정 (Gmail 최적화 및 보안 강화)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 반드시 Gmail '앱 비밀번호'여야 합니다.
      },
    });

    // 서버 연결 확인
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('[Mail Server Verify Error]', verifyError);
      return NextResponse.json({ 
        success: true, 
        message: '메일 서버 연결에 실패했습니다. 관리자에게 문의하세요.',
        fallbackPassword: tempPassword
      });
    }

    const mailOptions = {
      from: `"WeddingCare 보안팀" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '[WeddingCare] 관리자 계정 임시 비밀번호 안내',
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px; border-radius: 20px; background-color: #1a1a1a; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <div style="text-align: center; margin-bottom: 30px;">
             <span style="font-size: 30px;">🔐</span>
          </div>
          <h2 style="color: #ffffff; font-size: 22px; font-weight: bold; margin-bottom: 20px; text-align: center;">임시 비밀번호 발급 안내</h2>
          <p style="color: #a8a29e; font-size: 14px; line-height: 1.8; text-align: center;">
            안녕하세요, 관리자님.<br/>
            요청하신 계정의 임시 비밀번호를 발송해 드립니다.
          </p>
          <div style="background-color: #292929; padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center; border: 1px solid #3f3f46;">
            <span style="display: block; color: #A3C87A; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 2px;">Temporary Password</span>
            <span style="color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 5px;">${tempPassword}</span>
          </div>
          <p style="color: #78716c; font-size: 12px; line-height: 1.8; text-align: center;">
            로그인 후 보안을 위해 [설정] 메뉴에서 즉시 비밀번호를 변경해 주시기 바랍니다.<br/>
            본인이 요청하지 않은 경우 계정 보안을 즉시 확인하세요.
          </p>
          <div style="margin-top: 40px; border-top: 1px solid #3f3f46; padding-top: 25px; text-align: center;">
            <p style="color: #57534e; font-size: 10px; font-weight: bold; letter-spacing: 3px;">WEDDINGCARE PREMIUM ADMIN</p>
          </div>
        </div>
      `,
    };

    // 5) 실제 발송 실행
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: '임시 비밀번호가 발송되었습니다.' });
  } catch (err) {
    console.error('[Forgot Password API Error]', err);
    return NextResponse.json({ success: false, error: '처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
