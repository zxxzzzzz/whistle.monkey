import{d as e,c as t,r as s,o as n,a as o,b as a,e as r,f as c,w as i,I as l,B as u,L as d,g as h,_ as p,h as m,i as f,j as v,A as w}from"./vendor.3d34403b.js";var y=e({name:"App"});async function g(e){return async function(e,t){const s=new Request(e,{headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify(t),method:"post"});try{return(await fetch(s)).json()}catch(n){return}}("/cgi-bin/root",{path:e})}async function b(){return async function(e,t){t&&(e=`${e}?${new URLSearchParams(t).toString()}`);const s=new Request(e,{method:"get"});try{return(await fetch(s)).json()}catch(n){return}}("/cgi-bin/root")}y.render=function(e,o,a,r,c,i){const l=s("router-view");return n(),t(l)};const k=new WebSocket("ws://localhost:9999/ws/log");var C=e({name:"App",setup(){const e=o("");b().then((t=>{e.value=t.path}));const t=a([]);return k.addEventListener("message",(e=>{const s=JSON.parse(e.data);t.push(s)})),{root:e,items:t}},methods:{handleClick(){this.root?g(this.root):r.error("请输入地址")}}});const j={class:"flex flex-col h-full pt-4"},L={class:"flex"},S=h("确定"),_={class:"overflow-auto mt-4"};(C.__cssModules={}).$style={},C.render=function(e,s,o,a,r,h){const m=l,f=u,v=p,w=d;return n(),t("div",j,[c("div",L,[c(m,{"addon-before":"mock文件地址",value:e.root,"onUpdate:value":s[1]||(s[1]=t=>e.root=t),placeholder:"请输入地址",onPressEnter:e.handleClick},null,8,["value","onPressEnter"]),c(f,{onClick:e.handleClick},{default:i((()=>[S])),_:1},8,["onClick"])]),c("div",_,[c(w,{size:"small",bordered:"","data-source":e.items},{renderItem:i((({item:e})=>[c(v,{innerHTML:e.message},null,8,["innerHTML"])])),_:1},8,["data-source"])])])};var x=m({routes:[{path:"/",redirect:"/home"},{path:"/home",component:C}],history:f()});const A=v(y);A.use(x),A.use(w),A.mount("#app");