// CFTC Traders in Financial Futures, futures only. Field names verified against the live dataset gpe5-46if.
const URL_='https://publicreporting.cftc.gov/resource/gpe5-46if.json';
export const MARKETS={'098662':'DXY','099741':'EUR','096742':'GBP','097741':'JPY'};
const num=v=>Number(v)||0;
export function toRows(rows){return rows.filter(x=>MARKETS[x.cftc_contract_market_code]&&x.report_date_as_yyyy_mm_dd).map(x=>({market:MARKETS[x.cftc_contract_market_code],date:String(x.report_date_as_yyyy_mm_dd).slice(0,10),ll:num(x.lev_money_positions_long),ls:num(x.lev_money_positions_short),al:num(x.asset_mgr_positions_long),as:num(x.asset_mgr_positions_short),oi:num(x.open_interest_all)}))}
export async function syncCot(env,weeks=26,f=fetch){
const q=new URLSearchParams({'$where':`cftc_contract_market_code in(${Object.keys(MARKETS).map(c=>`'${c}'`).join(',')})`,'$order':'report_date_as_yyyy_mm_dd DESC','$limit':String(weeks*Object.keys(MARKETS).length)});
try{const r=await f(`${URL_}?${q}`,{headers:{accept:'application/json'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('CFTC answered '+r.status);const rows=toRows(await r.json());
const st=env.DB.prepare('INSERT INTO cot_snapshots(market,report_date,lev_long,lev_short,am_long,am_short,open_interest) VALUES(?,?,?,?,?,?,?) ON CONFLICT(market,report_date) DO UPDATE SET lev_long=excluded.lev_long,lev_short=excluded.lev_short,am_long=excluded.am_long,am_short=excluded.am_short,open_interest=excluded.open_interest');
if(rows.length)await env.DB.batch(rows.map(x=>st.bind(x.market,x.date,x.ll,x.ls,x.al,x.as,x.oi)));
await env.DB.prepare('INSERT INTO sync_log(job,ok,detail) VALUES(?,?,?)').bind('cot',1,`${rows.length} rows`).run();return rows.length}
catch(e){await env.DB.prepare('INSERT INTO sync_log(job,ok,detail) VALUES(?,?,?)').bind('cot',0,String(e.message||e).slice(0,200)).run();throw e}}