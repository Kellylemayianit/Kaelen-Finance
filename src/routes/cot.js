import {json,err} from '../http.js';import {syncCot,MARKETS} from '../cftc.js';
export async function get(req,env){const n=Math.min(52,Math.max(4,Number(new URL(req.url).searchParams.get('weeks'))||13)),markets={};
for(const m of Object.values(MARKETS)){const{results}=await env.DB.prepare('SELECT report_date,lev_long,lev_short,am_long,am_short FROM cot_snapshots WHERE market=? ORDER BY report_date DESC LIMIT ?').bind(m,n).all();
if(results.length){const r=results.reverse();markets[m]={dates:r.map(x=>x.report_date),net:r.map(x=>x.lev_long-x.lev_short),amNet:r.map(x=>x.am_long-x.am_short)}}}
return json({markets,source:'CFTC Traders in Financial Futures, leveraged funds'},200,{'cache-control':'public, max-age=300'})}
export async function sync(req,env){try{return json({synced:await syncCot(env)})}catch(e){return err(502,'Could not reach the CFTC: '+(e.message||e))}}