import { authed } from '../_lib.js';
export async function onRequestPost({ request, env }) {
  if (!(await authed(request, env))) return new Response('Unauthorized', { status: 401 });
  const data = await request.text();
  const b = env.GITHUB_BRANCH || 'main';
  const u = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/site-data.json`;
  const h = { Authorization: 'Bearer ' + env.GITHUB_TOKEN, Accept: 'application/vnd.github+json', 'User-Agent': 'admin-panel' };
  const g = await fetch(u + '?ref=' + b, { headers: h });
  const sha = g.ok ? (await g.json()).sha : undefined;
  const content = btoa(unescape(encodeURIComponent(data)));
  const p = await fetch(u, { method: 'PUT', headers: h, body: JSON.stringify({ message: 'Update via admin panel', content, sha, branch: b }) });
  return new Response(p.ok ? 'ok' : await p.text(), { status: p.ok ? 200 : 500 });
}
