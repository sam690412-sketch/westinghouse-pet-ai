export async function adminApi(path:string,options:RequestInit={}) {
 const r=await fetch(path,{...options,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest',...options.headers}});
 const data=await r.json();if(!r.ok)throw Error(data.error||`HTTP ${r.status}`);return data;
}
