interface Env {
    RESEND_API_KEY: string;
}

interface ContactPayload {
    name: string;
    email: string;
    phone: string;
    placement: string;
    size: string;
    description: string;
    consultation: string;
    consultationTime?: string;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions: PagesFunction = async () =>
    new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    let body: ContactPayload;

    try {
        body = await request.json() as ContactPayload;
    } catch {
        return Response.json(
            { error: 'Ogiltig förfrågan.' },
            { status: 400, headers: CORS_HEADERS }
        );
    }

    const { name, email, phone, placement, size, description, consultation, consultationTime } = body;

    if (!name || !email || !phone || !placement || !size || !description || !consultation) {
        return Response.json(
            { error: 'Obligatoriska fält saknas.' },
            { status: 400, headers: CORS_HEADERS }
        );
    }

    const emailText = [
        `Ny bokningsförfrågan – Alex Tattoo`,
        ``,
        `Namn:       ${name}`,
        `E-post:     ${email}`,
        `Telefon:    ${phone}`,
        ``,
        `Placering:  ${placement}`,
        `Storlek:    ${size}`,
        ``,
        `Konsultation: ${consultation}${consultationTime ? ` (${consultationTime})` : ''}`,
        ``,
        `Beskrivning:`,
        description,
    ].join('\n');

    const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Byt ut mot din verifierade Resend-domän, t.ex. noreply@alextattoo.se
            from: 'Alex Tattoo <onboarding@resend.dev>',
            // Byt ut mot din faktiska e-postadress
            to: ['din@email.se'],
            reply_to: email,
            subject: `Ny förfrågan från ${name}`,
            text: emailText,
        }),
    });

    if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error('Resend error:', err);
        return Response.json(
            { error: 'Kunde inte skicka mail. Försök igen senare.' },
            { status: 500, headers: CORS_HEADERS }
        );
    }

    return Response.json({ success: true }, { headers: CORS_HEADERS });
};
