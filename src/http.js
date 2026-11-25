export const json=(d,s=200,h={})=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...h}});
export const err=(s,m)=>json({error:m},s);
export const body=async req=>{try{return await req.json()}catch{return null}};