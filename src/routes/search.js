import {json,err} from '../http.js';
const J=async u=>{const r=await fetch(u,{cf:{cacheTtl:3600,cacheEverything:true},signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error(u+' '+r.status);return r.json()};
const num=v=>typeof v==='number'&&isFinite(v)?+v.toFixed(2):null;
// The parsed index lives in memory for an hour per Worker instance, so most searches cost almost nothing.
let IDX=null,at=0;
export async function index(){if(IDX&&Date.now()-at<36e5)return IDX;
const[p,c]=await Promise.all([J('https://api.llama.fi/protocols'),J('https://api.llama.fi/v2/chains')]);
const protocols=p.filter(x=>x&&x.name).map(x=>({n:x.name,s:x.slug||'',cat:x.category||'',tvl:Number(x.tvl)||0,d1:num(x.change_1d),d7:num(x.change_7d),d30:num(x.change_1m),ch:Array.isArray(x.chains)?x.chains:[],url:x.url||'',sym:x.symbol&&x.symbol!=='-'?x.symbol:''}));
const chains=c.filter(x=>x&&x.name).map(x=>({n:x.name,tvl:Number(x.tvl)||0,sym:x.tokenSymbol||''}));
IDX={protocols,chains};at=Date.now();return IDX}
const score=(n,sym,q)=>{const a=n.toLowerCase();if(sym&&sym.toLowerCase()===q)return 4;if(a===q)return 5;if(a.startsWith(q))return 3;if(a.includes(' '+q))return 2;return a.includes(q)?1:0};
const top=(list,q,k)=>list.map(x=>({x,s:score(x.n,x.sym,q)})).filter(r=>r.s>0).sort((a,b)=>b.s-a.s||b.x.tvl-a.x.tvl).slice(0,k).map(r=>r.x);
const pub={'cache-control':'public, max-age=300'};
export async function search(req){const q=(new URL(req.url).searchParams.get('q')||'').trim().toLowerCase().slice(0,40);if(q.length<2)return json({items:[]},200,pub);
try{const I=await index();const items=[...top(I.chains,q,5).map(c=>({kind:'chain',name:c.n,tvl:c.tvl,sym:c.sym})),...top(I.protocols,q,7).map(p=>({kind:'protocol',name:p.n,slug:p.s,category:p.cat,tvl:p.tvl,d7:p.d7}))];return json({items},200,pub)}
catch(e){return err(502,'DefiLlama is not answering: '+(e.message||e))}}
export async function chain(req){const name=(new URL(req.url).searchParams.get('name')||'').trim().toLowerCase();
try{const I=await index(),c=I.chains.find(x=>x.n.toLowerCase()===name);if(!c)return err(404,'No such chain.');
const h=await J('https://api.llama.fi/v2/historicalChainTvl/'+encodeURIComponent(c.n)),n=h.length,l=h[n-1]?.tvl,ch=k=>n>k&&h[n-1-k].tvl?+((l/h[n-1-k].tvl-1)*100).toFixed(2):null;
const prot=I.protocols.filter(p=>p.ch.includes(c.n)).sort((a,b)=>b.tvl-a.tvl).slice(0,15).map(p=>({name:p.n,slug:p.s,category:p.cat,tvl:p.tvl,d7:p.d7}));
return json({name:c.n,sym:c.sym,tvl:l??c.tvl,d1:ch(1),d7:ch(7),d30:ch(30),series:h.slice(-90).map(x=>Math.round(x.tvl/1e6)),protocols:prot},200,pub)}
catch(e){return err(502,'DefiLlama is not answering: '+(e.message||e))}}
export async function protocol(req){const slug=(new URL(req.url).searchParams.get('slug')||'').trim().toLowerCase();
try{const p=(await index()).protocols.find(x=>x.s.toLowerCase()===slug);if(!p)return err(404,'No such protocol.');
return json({name:p.n,slug:p.s,category:p.cat,tvl:p.tvl,d1:p.d1,d7:p.d7,d30:p.d30,chains:p.ch,url:p.url,sym:p.sym},200,pub)}
catch(e){return err(502,'DefiLlama is not answering: '+(e.message||e))}}