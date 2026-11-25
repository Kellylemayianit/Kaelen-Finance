import {json,err} from '../http.js';
const J=async u=>{const r=await fetch(u,{cf:{cacheTtl:3600,cacheEverything:true},signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error(u+' '+r.status);return r.json()};
const CH=[['sol','Solana','L1',['Solana']],['base','Base','L2',['Base']],['arb','Arbitrum','L2',['Arbitrum']],['eth','Ethereum','L1',['Ethereum']],['op','Optimism','L2',['OP Mainnet','Optimism']],['avax','Avalanche','L1',['Avalanche']]];
async function chain([id,name,type,names]){for(const n of names){try{const a=await J('https://api.llama.fi/v2/historicalChainTvl/'+encodeURIComponent(n));if(Array.isArray(a)&&a.length>8){const l=a.at(-1).tvl,p=a.at(-8).tvl;return{id,name,type,tvl:+(l/1e9).toFixed(2),d7:+((l/p-1)*100).toFixed(1),trend:l/p>1.01?'up':'flat',series:a.slice(-30).map(x=>Math.round(x.tvl/1e6))}}}catch{}}return null}
export async function flow(){try{const[nets,sc]=await Promise.all([Promise.all(CH.map(chain)),J('https://stablecoins.llama.fi/stablecoincharts/all')]);
const v=sc.map(x=>Number(x.totalCirculatingUSD?.peggedUSD??x.totalCirculating?.peggedUSD??0)).filter(x=>x>0),l=v.at(-1),p=v.at(-8);
const series=[...Array(12)].map((_,i)=>v[v.length-1-7*(11-i)]).filter(x=>x!=null).map(x=>+(x/1e9).toFixed(1));
const ok=nets.filter(Boolean);if(!ok.length)return err(502,'DefiLlama returned no chain data.');
return json({nets:ok,stable:{now:+(l/1e9).toFixed(1),d7:+((l/p-1)*100).toFixed(1),series},updated:new Date().toISOString()},200,{'cache-control':'public, max-age=900'})}catch(e){return err(502,'DefiLlama is not answering: '+(e.message||e))}}
export async function yields(){try{const d=await J('https://yields.llama.fi/pools'),ok=new Set(CH.flatMap(c=>c[3]));
const items=d.data.filter(p=>p.stablecoin&&p.tvlUsd>5e6&&p.apy>0&&p.apy<40&&ok.has(p.chain)).sort((a,b)=>b.apy-a.apy).slice(0,15).map(p=>({pool:p.symbol,project:p.project,chain:p.chain,apy:+p.apy.toFixed(2),tvl:Math.round(p.tvlUsd/1e6)}));
return json({items,updated:new Date().toISOString()},200,{'cache-control':'public, max-age=900'})}catch(e){return err(502,'DefiLlama is not answering: '+(e.message||e))}}