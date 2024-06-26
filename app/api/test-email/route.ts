import { EmailTemplate } from '@/components/emails/order-mail';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'MODEX <info@modexgaming.com>',
      to: ['sven.schuitemaker.2000@gmail.com'],
      subject: 'Hello world',
      react: EmailTemplate({ firstName: 'Sven' }),
      text: 'Hello world',
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
