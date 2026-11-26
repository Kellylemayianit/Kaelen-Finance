import {json} from '../http.js';import * as market from './market.js';
const call=async f=>{const r=await f();const b=await r.json();if(!r.ok)throw new Error(b.error||('HTTP '+r.status));return b};
export async function status(req,env){
const t=async(name,used,fn)=>{const s=Date.now();try{return{name,used,ok:true,detail:await fn(),ms:Date.now()-s}}catch(e){return{name,used,ok:false,detail:String(e.message||e).slice(0,200),ms:Date.now()-s}}};
const checks=await Promise.all([
t('Database (D1)','Check-ins, theses, EXY rows',async()=>{const r=await env.DB.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table'").first();return `${r.n} tables ready`}),
t('DefiLlama: networks and stablecoins','Money flow, Networks, Compare, Home',async()=>{const d=await call(()=>market.flow());return `${d.nets.length} networks, stablecoins $${d.stable.now}B`}),
t('DefiLlama: yields','Yields and stablecoins',async()=>{const d=await call(()=>market.yields());return `${d.items.length} pools`}),
t('CFTC positioning (stored)','Big-trader bets, Dollar and euro, Home',async()=>{const r=await env.DB.prepare('SELECT COUNT(*) AS n, MAX(report_date) AS d FROM cot_snapshots').first();if(!r.n)throw new Error('No rows yet. Press "Sync positioning now" on this page.');return `${r.n} rows, latest report ${r.d}`})]);
const{results}=await env.DB.prepare('SELECT job,ok,detail,at FROM sync_log ORDER BY id DESC LIMIT 5').all();
return json({checks,syncs:results,time:new Date().toISOString()})}