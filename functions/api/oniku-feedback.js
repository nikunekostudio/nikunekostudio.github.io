const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequestGet({env}){try{const {results}=await env.FEEDBACK_DB.prepare('SELECT id, body, created_at, nickname FROM feedback ORDER BY created_at DESC LIMIT 100').all();return json({entries:results})}catch{return json({error:'一時的に読み込めません'},503)}}
export async function onRequestPost(){return json({error:'修正投稿の受付は終了しました。過去の投稿は引き続き閲覧できます。',code:'FEEDBACK_CLOSED'},403)}
