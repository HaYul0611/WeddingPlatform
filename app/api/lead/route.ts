import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, phone, category, budget, message, sourcePage, timestamp } = body;

    // 필수 필드 검증
    if (!name || !phone || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const leadData = {
      name,
      phone,
      category,
      budget: budget ? parseInt(String(budget).replace(/\D/g, '')) : 0,
      message: message ?? '',
      source: sourcePage ?? 'unknown',
      created_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    };

    // 1. Supabase 'leads' 테이블에 저장
    const { error: supabaseError } = await supabase
      .from('leads')
      .insert([leadData]);

    if (supabaseError) {
      console.error('[Supabase Insert Error]', supabaseError);
      return NextResponse.json(
        { success: false, error: supabaseError.message },
        { status: 500 },
      );
    }

    // 2. Discord 알림 발송 (비동기, 응답 대기 안함)
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl && discordWebhookUrl !== 'your-discord-webhook-url') {
      fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🔔 새로운 상담 신청이 접수되었습니다',
            color: 0xF43F5E, // rose-500
            fields: [
              { name: '이름', value: leadData.name, inline: true },
              { name: '연락처', value: leadData.phone, inline: true },
              { name: '카테고리', value: leadData.category, inline: true },
              { name: '예산', value: `${budget}원`, inline: true },
              { name: '신청 경로', value: leadData.source, inline: true },
              { name: '메시지', value: leadData.message || '없음' },
            ],
            footer: { text: `접수 시간: ${leadData.created_at}` }
          }]
        })
      }).catch(err => console.error('[Discord Notification Error]', err));
    }

    // 3. 이메일 알림 발송 (비동기, 응답 대기 안함)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (emailUser && emailPass && emailUser !== 'your-email@gmail.com') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
      });

      const mailOptions = {
        from: emailUser,
        to: emailUser,
        subject: `[WeddingCare] 새로운 상담 신청: ${leadData.name}님`,
        html: `
          <h2>새로운 상담 신청 내역</h2>
          <ul>
            <li><b>이름:</b> ${leadData.name}</li>
            <li><b>연락처:</b> ${leadData.phone}</li>
            <li><b>카테고리:</b> ${leadData.category}</li>
            <li><b>예산:</b> ${budget}원</li>
            <li><b>신청 경로:</b> ${leadData.source}</li>
            <li><b>메시지:</b> ${leadData.message}</li>
            <li><b>신청 시간:</b> ${leadData.created_at}</li>
          </ul>
        `
      };

      transporter.sendMail(mailOptions).catch(err => console.error('[Email Notification Error]', err));
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[Lead API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
