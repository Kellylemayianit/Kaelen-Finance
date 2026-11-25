export const ASSETS=[
{id:'EURUSD',sym:'EUR/USD',name:'Euro / US dollar',cls:'fx',last:'1.0842',num:1.0842,dec:4,chg:.6,src:'cftc'},
{id:'DXY',sym:'DXY',name:'Dollar index, calculated',cls:'index',last:'104.20',num:104.2,dec:2,chg:-.8,src:'cftc'},
{id:'EXY',sym:'EXY',name:'Euro index, typed in',cls:'index',last:'—',num:null,chg:null,src:'manual'},
{id:'USDJPY',sym:'USD/JPY',name:'US dollar / yen',cls:'fx',last:'151.30',num:151.3,dec:2,chg:.2,src:'cftc'},
{id:'GBPUSD',sym:'GBP/USD',name:'Pound / US dollar',cls:'fx',last:'1.2610',num:1.261,dec:4,chg:.4,src:'cftc'},
{id:'XAUUSD',sym:'XAU/USD',name:'Gold',cls:'metals',last:'2,650',num:2650,dec:0,chg:1.1,src:'none'}];
export const MARKET_OF={DXY:'DXY',EURUSD:'EUR',GBPUSD:'GBP',USDJPY:'JPY'};
export const NETS=[{id:'sol',name:'Solana',type:'L1',tvl:8.1,d7:4.2,trend:'up'},{id:'base',name:'Base',type:'L2',tvl:4.3,d7:2.8,trend:'up'},{id:'arb',name:'Arbitrum',type:'L2',tvl:3,d7:.9,trend:'flat'},{id:'eth',name:'Ethereum',type:'L1',tvl:62,d7:1.4,trend:'up'},{id:'op',name:'Optimism',type:'L2',tvl:1.9,d7:.2,trend:'flat'},{id:'avax',name:'Avalanche',type:'L1',tvl:1.6,d7:-.4,trend:'flat'}];
export const POOLS=[{pool:'USDC-A',project:'sample',chain:'Solana',apy:6.1,tvl:320},{pool:'USDC-B',project:'sample',chain:'Solana',apy:5.7,tvl:140},{pool:'USDC-C',project:'sample',chain:'Base',apy:5.4,tvl:210},{pool:'USDT-D',project:'sample',chain:'Arbitrum',apy:4.9,tvl:150},{pool:'USDC-E',project:'sample',chain:'Optimism',apy:4.4,tvl:90},{pool:'USDC-F',project:'sample',chain:'Ethereum',apy:3.8,tvl:1800}];
export const THESIS={version:1,asset:'EURUSD',title:'Dollar weakens, EUR/USD higher',bias:'Up',windowMin:45,windowMax:90,level:'[LEVEL]',startedOn:'2026-11-06'};
export const thesisDay=s=>Math.max(0,Math.floor((Date.now()-new Date(s+'T00:00:00Z'))/864e5));
export const SEED_CHECKINS=[{label:'Week 47',status:'Unchanged',note:'Dollar index still soft. Positioning less stretched than last month.'},{label:'Week 46',status:'Unchanged',note:'No new data against the view.'},{label:'Week 45',status:'Started',note:'Thesis opened: dollar weakens over 45–90 days.'}];
export const STABLE=[1.1,1.4,1.3,1.8,2.0,2.2,2.1,2.6,2.9,3.1,3.0,3.5];
export function series(seed,n=60){let s=0;for(const c of String(seed))s=(s*31+c.charCodeAt(0))>>>0;const r=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;let v=.5;const a=[];for(let i=0;i<n;i++){v+=(r()-.46)*.07;a.push(v)}const lo=Math.min(...a),hi=Math.max(...a);return a.map(x=>.1+.8*(x-lo)/(hi-lo))}
export const weekLabel=i=>new Date(2026,10,20-7*i).toLocaleDateString('en-KE',{day:'numeric',month:'short'});
export const sampleCot=()=>({markets:Object.fromEntries(['DXY','EUR','GBP','JPY'].map(m=>[m,{dates:[...Array(13)].map((_,i)=>weekLabel(12-i)),net:series('c'+m,13).map(x=>Math.round((x-.5)*48)*1000)}])),sample:true});
export const withDay=t=>t&&{...t,day:thesisDay(t.startedOn),total:t.windowMax};