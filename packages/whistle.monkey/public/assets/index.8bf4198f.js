import{d as e,c as s,r as t,o as n,a,b as o,e as r,w as l,F as c,f as u,I as i,B as d,t as p,g as h,h as m,i as v,j as f,A as w}from"./vendor.a0780dcb.js";var y=e({name:"App"});async function b(e){return async function(e,s){const t=new Request(e,{headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify(s),method:"post"});try{return(await fetch(t)).json()}catch(n){return}}("/cgi-bin/root",{path:e})}y.render=function(e,a,o,r,l,c){const u=t("router-view");return n(),s(u)};const k=new WebSocket("ws://localhost:9999/ws/log");var g=e({name:"App",setup(){const e=a([]);return k.addEventListener("message",(s=>{e.push(JSON.parse(s.data))})),{root:o(""),items:e}},methods:{handleClick(){b(this.root)}}});const C={class:"flex"},j=h("确定"),A=r("div",null,null,-1);(g.__cssModules={}).$style={},g.render=function(e,t,a,o,h,m){const v=i,f=d;return n(),s(c,null,[r("div",C,[r(v,{"addon-before":"mock文件地址",value:e.root,"onUpdate:value":t[1]||(t[1]=s=>e.root=s),placeholder:"请输入地址"},null,8,["value"]),r(f,{onClick:e.handleClick},{default:l((()=>[j])),_:1},8,["onClick"])]),r("div",null,[(n(!0),s(c,null,u(e.items,(e=>(n(),s("div",null,p(e.path),1)))),256))]),A],64)};var S=m({routes:[{path:"/",redirect:"/home"},{path:"/home",component:g}],history:v()});const _=f(y);_.use(S),_.use(w),_.mount("#app");
