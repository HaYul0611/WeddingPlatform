import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'ohayul.me@gmail.com',
        pass: process.env.GMAIL_PASS || 'dummy-password',
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER || 'ohayul.me@gmail.com',
      to: 'ohayul.me@gmail.com',
      subject: `[새 문의 접수] ${title}`,
      text: content,
      html: `<h3>새로운 1:1 문의가 접수되었습니다.</h3><br/><strong>제목:</strong> ${title}<br/><br/><strong>내용:</strong><br/>${content.replace(/\n/g, '<br/>')}`,
    };

    // 실제 발송 대신 콘솔 모의 출력 (비밀번호 설정 전이므로 에러 방지)
    if (process.env.GMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- [MOCK] Email Sending ---');
      console.log('To: ohayul.me@gmail.com');
      console.log(`Subject: [새 문의 접수] ${title}`);
      console.log(`Content: ${content}`);
      console.log('----------------------------');
    }

    return NextResponse.json({ success: true, message: '문의가 접수되었습니다.' });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ success: false, error: '이메일 전송에 실패했습니다.' }, { status: 500 });
  }
}
