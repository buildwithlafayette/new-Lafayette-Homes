// /api/ping-node.js  (Node runtime)
export default function handler(req, res) {
  const hasKey = !!process.env.RESEND_API_KEY;
  res.setHeader("content-type", "application/json");
  res.status(200).send(JSON.stringify({ ok: true, runtime: "node", resend_key_present: hasKey }));
}
