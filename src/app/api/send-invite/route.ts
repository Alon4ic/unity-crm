import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getInviteEmailHtml } from '@/emails/templates/inviteEmail';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
    const { email, code, signupLink } = await req.json();
    console.log(email);

    const html = getInviteEmailHtml(code, signupLink);

    if (!email || !code || !signupLink) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    try {
        const response = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Ваш инвайт-код',
            html,
        });
        console.log('Ответ от Resend:', response);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Resend email error:', error);
        return NextResponse.json(
            { error: 'Ошибка отправки письма' },
            { status: 500 }
        );
    }
}
