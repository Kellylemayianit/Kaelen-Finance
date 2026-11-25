import {json,err,body} from '../http.js';
const ST=['Unchanged','Stronger','Weaker','Invalidated','Started'];
export async function list(req,env){const{results}=await env.DB.prepare('SELECT id,created_at,label,status,note FROM checkins ORDER BY id DESC LIMIT 200').all();return json({items:results})}
export async function add(req,env){const b=await body(req);if(!b)return err(400,'Send JSON.');const status=String(b.status||''),note=String(b.note||'').trim();
if(!ST.includes(status))return err(400,'Unknown status.');if(note.length<3||note.length>2000)return err(400,'Note must be 3 to 2000 characters.');
const label=String(b.label||new Date().toLocaleDateString('en-KE',{day:'numeric',month:'short',timeZone:'Africa/Nairobi'})).slice(0,40);
const row=await env.DB.prepare('INSERT INTO checkins(label,status,note) VALUES(?,?,?) RETURNING id,created_at,label,status,note').bind(label,status,note).first();return json(row,201)}