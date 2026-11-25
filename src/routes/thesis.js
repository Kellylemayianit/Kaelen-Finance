import {json,err,body} from '../http.js';
const ASSETS=['EURUSD','DXY','USDJPY','GBPUSD','XAUUSD'],D=/^\d{4}-\d{2}-\d{2}$/,I=v=>Number.isInteger(v)&&v>=1&&v<=365;
export async function get(req,env){const{results}=await env.DB.prepare('SELECT * FROM theses ORDER BY version DESC LIMIT 20').all();return json({current:results[0]||null,versions:results})}
export async function add(req,env){const b=await body(req);if(!b)return err(400,'Send JSON.');
const title=String(b.title||'').trim(),level=String(b.invalidation||'').trim().slice(0,40);
if(!ASSETS.includes(b.asset))return err(400,'Unknown asset.');if(title.length<3||title.length>140)return err(400,'Statement must be 3 to 140 characters.');
if(!['Up','Down','Neutral'].includes(b.bias))return err(400,'Bias must be Up, Down or Neutral.');if(!I(b.window_min)||!I(b.window_max)||b.window_min>b.window_max)return err(400,'Window days must be whole numbers, min no bigger than max.');
if(!D.test(b.started_on||''))return err(400,'started_on must be YYYY-MM-DD.');
const v=(await env.DB.prepare('SELECT COALESCE(MAX(version),0)+1 AS v FROM theses').first()).v;
const row=await env.DB.prepare('INSERT INTO theses(version,asset,title,bias,window_min,window_max,invalidation,started_on) VALUES(?,?,?,?,?,?,?,?) RETURNING *').bind(v,b.asset,title,b.bias,b.window_min,b.window_max,level,b.started_on).first();return json(row,201)}