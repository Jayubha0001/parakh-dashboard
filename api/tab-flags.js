// Vercel serverless function: stores which sidebar tabs are visible, for EVERYONE.
//
// One-time setup in Vercel (Project -> Storage -> Create -> Upstash Redis, connect to this project),
// and add an Environment Variable:  ADMIN_PASSWORD = <your password>   then Redeploy.
//   GET  /api/tab-flags                      -> { flags }   (public)
//   POST /api/tab-flags {action:"verify", password}          -> { ok }
//   POST /api/tab-flags {password, flags}                    -> { ok }  (saves)

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "parakh-tab-flags";

const redis = async (command) => {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error(`Redis ${r.status}`);
  return (await r.json()).result;
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOKEN) return res.status(503).json({ error: "Storage not connected (Upstash Redis)." });

  try {
    if (req.method === "GET") {
      const raw = await redis(["GET", KEY]);
      return res.status(200).json({ flags: raw ? JSON.parse(raw) : null });
    }
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const expected = process.env.ADMIN_PASSWORD;
      if (!expected) return res.status(503).json({ error: "ADMIN_PASSWORD env variable is not set in Vercel." });
      if (body.password !== expected) return res.status(401).json({ error: "Incorrect password" });
      if (body.action === "verify") return res.status(200).json({ ok: true });
      if (!body.flags || typeof body.flags !== "object") return res.status(400).json({ error: "flags missing" });
      const clean = {};
      Object.entries(body.flags).forEach(([k, v]) => (clean[String(k).slice(0, 40)] = !!v));
      await redis(["SET", KEY, JSON.stringify(clean)]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
