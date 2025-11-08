// /api/contact.js
export const config = { runtime: "edge" };

function parseForm(body) {
  const p = new URLSearchParams(body);
  const get = (k) => (p.get(k) || "").trim();
  return {
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    location: get("location"),
    notes: get("notes"),
    gotcha: get("_gotcha"), // honeypot
  };
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const text = await req.text();
  const data = parseForm(text);
  if (data.gotcha) return new Response("OK", { status: 200 }); // drop bots

  if (!data.name || !data.email) {
    return new Response("Missing fields", { status: 400 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return new Response("Server not configured", { status: 500 });

  const subject = `New inquiry — ${data.name}`;
  const to = "info@buildwithlafayette.com";       // delivered to you
  const from = "Lafayette Homes <info@buildwithlafayette.com>"; // sent from your domain

  const html = `
    <div style="font:16px system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#111">
      <h2>New website inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
      <p><strong>Build location:</strong> ${escapeHtml(data.location)}</p>
      <p><strong>Notes:</strong><br>${escapeHtml(data.notes).replace(/\n/g, "<br>")}</p>
    </div>
  `;

  const payload = {
    from,
    to,
    subject,
    html,
    reply_to: data.email, // click Reply goes to the lead
    text: [
      `New website inquiry`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      `Build location: ${data.location}`,
      ``,
      `Notes:`,
      data.notes || "",
    ].join("\n"),
  };

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Optional: also send an automatic confirmation to the lead (uncomment to enable)
  // if (r.ok) {
  //   await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       from,
  //       to: data.email,
  //       subject: "We got your message — Lafayette Homes",
  //       text: `Thanks ${data.name}, we’ll reach out shortly at this email or ${data.phone || "your phone"}.`,
  //     }),
  //   });
  // }

  if (r.ok) {
    const url = new URL("/thank-you.html", req.url);
    if (data.name) url.searchParams.set("name", data.name);
    return Response.redirect(url.toString(), 303);
  }

  const errText = await r.text();
  return new Response(`Email send failed: ${errText}`, { status: 500 });
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
