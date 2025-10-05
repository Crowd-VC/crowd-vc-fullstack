import { EmailTemplate } from '../../../components/ui/email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
   const body = await request.json();
   const { email, firstName } = body;
    const { data, error } = await resend.emails.send({
      from: 'CrowdVC <onboarding@resend.dev>',
      to: [email],
      subject: 'Hello world',
      react: EmailTemplate({ firstName }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}