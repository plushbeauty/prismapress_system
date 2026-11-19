import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://prismapresssystem-2315rkrly-plushbeauty.vercel.app",
  "https://prismapresssystem.vercel.app",
  "http://localhost:5173",
]);
const headers = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://prismapresssystem-2315rkrly-plushbeauty.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  "Vary": "Origin",
  "Content-Type": "application/json; charset=utf-8",
});
const json = (body: unknown, status = 200, origin: string | null = null) =>
  new Response(JSON.stringify(body), { status, headers: headers(origin) });
const clean = (v: unknown) => String(v ?? "").trim();
const emailNorm = (v: unknown) => clean(v).toLowerCase();

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin) });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405, origin);

  try {
    const supabaseUrl = clean(Deno.env.get("SUPABASE_URL"));
    const secretsRaw = clean(Deno.env.get("SUPABASE_SECRET_KEYS"));
    let adminKey = "";
    if (secretsRaw) {
      try { adminKey = String(JSON.parse(secretsRaw)?.default ?? "").trim(); } catch { /* legacy fallback below */ }
    }
    adminKey ||= clean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    if (!supabaseUrl || !adminKey) return json({ error: "SERVER_CONFIGURATION_ERROR" }, 500, origin);

    const admin = createClient(supabaseUrl, adminKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const body = await req.json();
    const action = clean(body?.action || "status");

    const { data: masters, error: lookupError } = await admin
      .from("gr_usuarios")
      .select("id")
      .eq("is_master", true)
      .gte("nivel_admin", 100)
      .is("empresa_id", null)
      .limit(1);
    if (lookupError) throw lookupError;

    if (action === "status") return json({ ok: true, available: !masters?.length }, 200, origin);
    if (action !== "bootstrap_master") return json({ error: "ACTION_INVALID" }, 400, origin);
    if (masters?.length) return json({ error: "MASTER_ALREADY_EXISTS", locked: true }, 409, origin);

    const nome = clean(body?.nome);
    const email = emailNorm(body?.email);
    const password = String(body?.password ?? "");
    if (nome.length < 3) return json({ error: "NOME_INVALIDO" }, 400, origin);
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "EMAIL_INVALIDO" }, 400, origin);
    if (password.length < 8) return json({ error: "SENHA_MINIMA_8" }, 400, origin);

    const created = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { nome, sistema: "PRISMAPRES" },
    });
    if (created.error || !created.user) throw created.error ?? new Error("AUTH_CREATE_FAILED");

    const inserted = await admin.from("gr_usuarios").insert({
      id: created.user.id,
      empresa_id: null,
      nome,
      email,
      papel: "master",
      ativo: true,
      is_master: true,
      nivel_admin: 100,
    }).select("id").single();

    if (inserted.error || !inserted.data) {
      await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined);
      if (inserted.error?.code === "23505") return json({ error: "MASTER_ALREADY_EXISTS", locked: true }, 409, origin);
      throw inserted.error ?? new Error("MASTER_PROFILE_CREATE_FAILED");
    }
    return json({ ok: true, master: true, user_id: inserted.data.id, email, nome }, 201, origin);
  } catch (error) {
    console.error("[prismapres-master-bootstrap]", error);
    return json({ error: error instanceof Error ? error.message : "MASTER_BOOTSTRAP_FAILED" }, 500, origin);
  }
});
