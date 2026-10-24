const enc = new TextEncoder();
export async function sign(key, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', k, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(s)));
}
export async function authed(request, env) {
  const t = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  const [exp, sig] = t.split('.');
  return !!(env.ADMIN_PASSWORD && exp && Date.now() < +exp && sig === await sign(env.ADMIN_PASSWORD, exp));
}
