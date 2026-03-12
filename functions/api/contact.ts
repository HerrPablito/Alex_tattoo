interface Env {
    RESEND_API_KEY: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PagesFunction<E = Record<string, unknown>> = (ctx: { request: Request; env: E; params: Record<string, string> }) => Response | Promise<Response>;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions: PagesFunction = async () =>
    new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    let formData: FormData;

    try {
        formData = await request.formData();
    } catch {
        return Response.json(
            { error: 'Ogiltig förfrågan.' },
            { status: 400, headers: CORS_HEADERS }
        );
    }

    const name         = formData.get('name')         as string | null;
    const email        = formData.get('email')        as string | null;
    const phone        = formData.get('phone')        as string | null;
    const placement    = formData.get('placement')    as string | null;
    const size         = formData.get('size')         as string | null;
    const description  = formData.get('description')  as string | null;
    const consultation = formData.get('consultation') as string | null;
    const consultationTime = formData.get('consultationTime') as string | null;

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

    // Build attachments from uploaded files
    const attachments: { filename: string; content: string }[] = [];
    const fileEntries = formData.getAll('files') as File[];
    for (const file of fileEntries) {
        if (!(file instanceof File) || file.size === 0) continue;
        const buffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        attachments.push({ filename: file.name, content: base64 });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'Alex Tattoo <noreply@axst.se>',
            to: ['axsttattoos@gmail.com'],
            reply_to: email,
            subject: `Ny förfrågan från ${name}`,
            text: emailText,
            ...(attachments.length > 0 && { attachments }),
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
