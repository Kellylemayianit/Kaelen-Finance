export const usd=n=>n==null?'—':n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(1)+'M':n>=1e3?'$'+(n/1e3).toFixed(0)+'K':'$'+Math.round(n);
export const pct=n=>n==null?'—':(n>0?'▲ ':n<0?'▼ ':'')+Math.abs(n)+'%';
export const cls=n=>n==null?'':n>=0?'up':'dn';