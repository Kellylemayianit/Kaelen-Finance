import {json,err} from './http.js';import {allowed} from './auth.js';import {syncCot} from './cftc.js';
import * as checkins from './routes/checkins.js';import * as exy from './routes/exy.js';import * as thesis from './routes/thesis.js';import * as cot from './routes/cot.js';import * as market from './routes/market.js';import {status} from './routes/status.js';
// [method, path pattern, handler, needs key]
const ROUTES=[
['GET',/^\/api\/status$/,status,false],
['GET',/^\/api\/health$/,()=>json({ok:true,time:new Date().toISOString()}),false],
['GET',/^\/api\/flow$/,market.flow,false],['GET',/^\/api\/yields$/,market.yields,false],['GET',/^\/api\/cot$/,cot.get,false],
['POST',/^\/api\/cot\/sync$/,cot.sync,true],
['GET',/^\/api\/checkins$/,checkins.list,true],['POST',/^\/api\/checkins$/,checkins.add,true],
['GET',/^\/api\/exy$/,exy.list,true],['POST',/^\/api\/exy$/,exy.upsert,true],['DELETE',/^\/api\/exy\/(\d{4}-\d{2}-\d{2})$/,(q,e,m)=>exy.remove(q,e,m[1]),true],
['GET',/^\/api\/thesis$/,thesis.get,true],['POST',/^\/api\/thesis$/,thesis.add,true]];
export default{
async fetch(req,env,ctx){const u=new URL(req.url);if(!u.pathname.startsWith('/api/'))return env.ASSETS.fetch(req);
let seen=false;for(const[method,re,fn,priv]of ROUTES){const m=u.pathname.match(re);if(!m)continue;seen=true;if(method!==req.method)continue;
if(priv){if(!env.WRITE_KEY)return err(503,'WRITE_KEY is not set on the Worker yet.');if(!allowed(req,env))return err(401,'Missing or wrong key.')}
try{return await fn(req,env,m)}catch(e){console.error(u.pathname,e);return err(500,'Something went wrong on the server.')}}
return seen?err(405,'Method not allowed.'):err(404,'No such endpoint.')},
async scheduled(ev,env,ctx){ctx.waitUntil(syncCot(env).catch(e=>console.error('cot sync failed',e)))}};