import {set} from './store.js';
import {SEED_CHECKINS,NETS,POOLS,THESIS,STABLE,sampleCot} from '../data/sample.js';
export const mode={live:false};
const KEY='rd-key',ls=(f,d)=>{try{return f()}catch{return d}};
export const hasKey=()=>ls(()=>!!localStorage.getItem(KEY),false);
export const setKey=k=>ls(()=>localStorage.setItem(KEY,k));
const L={get:(k,d=[])=>ls(()=>JSON.parse(localStorage.getItem('rd:l:'+k))??d,d),set:(k,v)=>ls(()=>localStorage.setItem('rd:l:'+k,JSON.stringify(v)))};
const E=(m,f)=>Object.assign(new Error(m),f);
async function call(path,o={}){let r;try{r=await fetch(path,{...o,signal:AbortSignal.timeout(15000),headers:{'content-type':'application/json',...(hasKey()?{'x-rd-key':ls(()=>localStorage.getItem(KEY),'')}:{}),...o.headers}})}catch{throw E('offline',{offline:true})}
if(!(r.headers.get('content-type')||'').includes('json'))throw E('offline',{offline:true});
const b=await r.json().catch(()=>({}));if(r.status===401){set({keyDlg:true});throw E('locked',{locked:true})}if(!r.ok)throw E(b.error||`Request failed (${r.status})`,{});return b}
async function read(path,fb){try{const d=await call(path);mode.live=true;return d}catch(e){if(e.offline||e.locked)mode.live=false;return fb()}}
export const checkins=async()=>{const d=await read('/api/checkins',()=>[...L.get('checkins'),...SEED_CHECKINS]);return Array.isArray(d)?d:d.items};
export async function addCheckin(b){try{const r=await call('/api/checkins',{method:'POST',body:JSON.stringify(b)});mode.live=true;return r}catch(e){if(e.locked)return null;if(!e.offline)throw e;mode.live=false;const it={label:new Date().toLocaleDateString('en-KE',{day:'numeric',month:'short'}),...b};L.set('checkins',[it,...L.get('checkins')]);return it}}
export const exy=async()=>{const d=await read('/api/exy',()=>L.get('exy'));return Array.isArray(d)?d:d.items};
export async function addExy(b){try{const r=await call('/api/exy',{method:'POST',body:JSON.stringify(b)});mode.live=true;return r}catch(e){if(e.locked)return null;if(!e.offline)throw e;mode.live=false;L.set('exy',[b,...L.get('exy').filter(x=>x.report_date!==b.report_date)].sort((a,c)=>c.report_date.localeCompare(a.report_date)));return b}}
export async function removeExy(date){try{await call('/api/exy/'+date,{method:'DELETE'})}catch(e){if(e.locked)return false;if(!e.offline)throw e;L.set('exy',L.get('exy').filter(x=>x.report_date!==date))}return true}
const mapTh=c=>c&&{version:c.version,asset:c.asset,title:c.title,bias:c.bias,windowMin:c.window_min,windowMax:c.window_max,level:c.invalidation||'',startedOn:c.started_on};
export const thesis=async()=>{const d=await read('/api/thesis',()=>({local:true}));return d.local?(L.get('thesis',null)||THESIS):mapTh(d.current)};
export async function addThesis(b){try{const r=await call('/api/thesis',{method:'POST',body:JSON.stringify(b)});mode.live=true;return mapTh(r)}catch(e){if(e.locked)return null;if(!e.offline)throw e;mode.live=false;const t={version:1,asset:b.asset,title:b.title,bias:b.bias,windowMin:b.window_min,windowMax:b.window_max,level:b.invalidation,startedOn:b.started_on};L.set('thesis',t);return t}}
export const cot=async()=>{const d=await read('/api/cot?weeks=13',sampleCot);return d};
export async function syncCot(){return call('/api/cot/sync',{method:'POST'})}
export const flow=async()=>{const d=await read('/api/flow',()=>({nets:NETS,stable:{now:3.5,d7:2.1,series:STABLE},sample:true}));return d};
export const yields=async()=>{const d=await read('/api/yields',()=>POOLS);return Array.isArray(d)?d:d.items};
export const status=async()=>read('/api/status',()=>({offline:true}));
export async function search(q,signal){let r;try{r=await fetch('/api/search?q='+encodeURIComponent(q),{signal})}catch(e){if(e.name==='AbortError')throw e;return null}
if(!(r.headers.get('content-type')||'').includes('json')||!r.ok)return null;return r.json()}
export const chainDetail=name=>read('/api/chain?name='+encodeURIComponent(name),()=>null);
export const protocolDetail=slug=>read('/api/protocol?slug='+encodeURIComponent(slug),()=>null);