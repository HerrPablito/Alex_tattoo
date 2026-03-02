export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://beta.axst.se",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // -------------------------
    // GET /api/gallery
    // -------------------------
    if (url.pathname === "/api/gallery" && request.method === "GET") {
      const endpoint = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/search`;
      const auth = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);
      const folder = env.CLOUDINARY_FOLDER || "tattoos";

      const body = {
        expression: `folder:${folder}/* AND resource_type:image`,
        sort_by: [{ created_at: "desc" }],
        max_results: 200,
        with_field: ["tags", "context", "metadata"],
      };

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return new Response(
          JSON.stringify({ error: "Cloudinary fetch failed", details: text }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const data = await resp.json();

      // Debug: logga första resursens rådata för att se exakt vad Cloudinary returnerar
      if (data.resources?.length > 0) {
        const sample = data.resources[0];
        console.log("SAMPLE context:", JSON.stringify(sample.context));
        console.log("SAMPLE metadata:", JSON.stringify(sample.metadata));
      }

      const items = (data.resources || []).map((r) => ({
        publicId: r.public_id,
        url: r.secure_url,
        createdAt: r.created_at,
        tags: r.tags || [],
        title: r?.context?.custom?.caption || r?.context?.custom?.title || r?.metadata?.title || "",
        description: r?.context?.custom?.alt || r?.context?.custom?.description || r?.metadata?.description || "",
        category: r?.context?.custom?.category || r?.metadata?.category || "",
        width: r.width,
        height: r.height,
      }));

      return new Response(JSON.stringify({ items }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
          ...corsHeaders,
        },
      });
    }

    // -------------------------
    // POST /api/contact
    // -------------------------
    if (url.pathname === "/api/contact" && request.method === "POST") {
      let formData;
      try {
        formData = await request.formData();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid form data" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const placement = String(formData.get("placement") || "").trim();
      const size = String(formData.get("size") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const consultation = String(formData.get("consultation") || "").trim();
      const consultationTime = String(formData.get("consultationTime") || "").trim();

      if (!name || !email || !phone || !placement || !size || !description || !consultation) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Konvertera uppladdade filer till base64-bilagor för Resend
      const attachments = [];
      try {
        const fileEntries = formData.getAll("files");
        for (const entry of fileEntries) {
          if (entry instanceof File && entry.size > 0) {
            const buffer = await entry.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
            attachments.push({ filename: entry.name, content: btoa(binary) });
          }
        }
      } catch (fileErr) {
        console.error("File processing error:", fileErr);
        // Fortsätt utan bilagor om något går fel
      }

      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "booking@axst.se",
          to: ["thepablopaez@gmail.com"],
          reply_to: email,
          subject: `Ny bokningsförfrågan från ${name}`,
          html: `
            <h2>Ny bokningsförfrågan</h2>
            <p><strong>Namn:</strong> ${escapeHtml(name)}</p>
            <p><strong>E-post:</strong> ${escapeHtml(email)}</p>
            <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
            <hr />
            <p><strong>Placering:</strong> ${escapeHtml(placement)}</p>
            <p><strong>Storlek:</strong> ${escapeHtml(size)}</p>
            <p><strong>Konsultation:</strong> ${escapeHtml(consultation)}${consultationTime ? ` (${escapeHtml(consultationTime)})` : ""}</p>
            <hr />
            <p><strong>Beskrivning:</strong></p>
            <p style="white-space: pre-line">${escapeHtml(description)}</p>
          `,
          ...(attachments.length > 0 && { attachments }),
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return new Response(JSON.stringify({ error: "Mail failed", details: text }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fallback
    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return m;
    }
  });
}
