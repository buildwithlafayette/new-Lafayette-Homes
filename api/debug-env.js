export const config = { runtime: "edge" };

export default async function handler() {
  const vercelEnv = process.env.VERCEL_ENV || "unknown";
  const key = process.env.RESEND_API_KEY || "";
  const masked =
    key ? key.slice(0, 4) + "..." + key.slice(-4) : ""; // don't leak the whole key
  return new Response(
    JSON.stringify({
      ok: true,
      vercel_env: vercelEnv,          // "production" or "preview"
      has_key: !!key,                 // true/false
      key_preview: masked             // e.g., "re_Xd...Za5"
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
