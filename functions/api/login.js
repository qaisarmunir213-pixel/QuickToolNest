import { sign } from '../_lib.js';
export async function onRequestPost({ request, env }) {
  const { password } = await request.json().catch(() => ({}));
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD)
    return Response.json({ ok: false }, { status: 401 });
  const exp = Date.now() + 12 * 3600 * 1000; // 12 hours
  return Response.json({ ok: true, token: exp + '.' + await sign(env.ADMIN_PASSWORD, String(exp)) });
}
