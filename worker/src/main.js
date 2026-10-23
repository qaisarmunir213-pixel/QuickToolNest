// QuickToolNest Cloudflare Worker API. Bind D1 database as DB.
// Set secrets: ADMIN_PASSWORD, JWT_SECRET. Do not put secrets in frontend files.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:cors});
async function sign(payload,secret){
  const enc=new TextEncoder(),key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const b64=s=>btoa(String.fromCharCode(...new Uint8Array(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const data=b64(enc.encode(JSON.stringify(payload)));
  const sig=await crypto.subtle.sign("HMAC",key,enc.encode(data));
  return data+"."+b64(sig);
}
async function verify(token,secret){
  try{
    const [data,sig]=token.split("."),enc=new TextEncoder(),key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
    const from=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((s.length+3)%4)),c=>c.charCodeAt(0));
    const ok=await crypto.subtle.verify("HMAC",key,from(sig),enc.encode(data));
    if(!ok)return false;const p=JSON.parse(new TextDecoder().decode(from(data)));return p.exp>Date.now()/1000;
  }catch{return false}
}
export default {
 async fetch(request,env){
  if(request.method==="OPTIONS")return new Response(null,{headers:cors});
  const url=new URL(request.url);
  try{
   if(request.method==="POST"&&url.pathname==="/api/login"){
    const body=await request.json();
    if(!env.ADMIN_PASSWORD||!env.JWT_SECRET)return json({error:"Worker secrets configure nahi hain."},500);
    if(typeof body.password!=="string"||body.password!==env.ADMIN_PASSWORD)return json({error:"Password ghalat hai."},401);
    const token=await sign({role:"admin",exp:Math.floor(Date.now()/1000)+3600},env.JWT_SECRET);
    return json({token,expires_in:3600});
   }
   if(url.pathname==="/api/public/settings"&&request.method==="GET"){
    const row=await env.DB.prepare("SELECT value FROM site_data WHERE section='settings'").first();
    return json({data:row?JSON.parse(row.value):{}});
   }
   if(url.pathname.startsWith("/api/admin/")){
    const auth=(request.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
    if(!auth||!await verify(auth,env.JWT_SECRET||""))return json({error:"Unauthorized. Dobara login karein."},401);
    if(url.pathname==="/api/admin/data"&&request.method==="GET"){
      const section=url.searchParams.get("section");
      if(!["tools","pages","ads","settings"].includes(section))return json({error:"Invalid section"},400);
      const row=await env.DB.prepare("SELECT value FROM site_data WHERE section=?").bind(section).first();
      return json({section,data:row?JSON.parse(row.value):({tools:[],pages:[],ads:{enabled:false,clientId:"",slots:[]},settings:{siteName:"QuickToolNest",contactEmail:""}}[section])});
    }
    if(url.pathname==="/api/admin/data"&&request.method==="PUT"){
      const body=await request.json(),section=body.section;
      if(!["tools","pages","ads","settings"].includes(section))return json({error:"Invalid section"},400);
      const value=JSON.stringify(body.data);
      if(value.length>200000)return json({error:"Data too large (max 200KB)."},413);
      await env.DB.prepare("INSERT INTO site_data(section,value,updated_at) VALUES(?,?,?) ON CONFLICT(section) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(section,value,new Date().toISOString()).run();
      return json({ok:true,section});
    }
    return json({error:"Not found"},404);
   }
   return json({name:"QuickToolNest Admin API",status:"ok",routes:["POST /api/login","GET /api/admin/data?section=tools|pages|ads|settings","PUT /api/admin/data","GET /api/public/settings"]});
  }catch(e){return json({error:"Server error",detail:env.DEBUG==="true"?String(e):undefined},500)}
 }
};
