import{d as e,c as t,r as s,o as n,a,b as o,e as r,f as c,w as l,F as i,g as u,I as d,B as h,h as p,_ as m,i as f,j as v,k as y,A as w}from"./vendor.7e5a21dd.js";var g=e({name:"App"});async function k(e){return async function(e,t){const s=new Request(e,{headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify(t),method:"post"});try{return(await fetch(s)).json()}catch(n){return}}("/cgi-bin/root",{path:e})}async function b(){return async function(e,t){t&&(e=`${e}?${new URLSearchParams(t).toString()}`);const s=new Request(e,{method:"get"});try{return(await fetch(s)).json()}catch(n){return}}("/cgi-bin/root")}g.render=function(e,a,o,r,c,l){const i=s("router-view");return n(),t(i)};const C=new WebSocket("ws://localhost:9999/ws/log");var j=e({name:"App",setup(){const e=a("");b().then((t=>{e.value=t.path}));const t=o([]);return C.addEventListener("message",(e=>{const s=JSON.parse(e.data);t.push(s)})),{root:e,items:t}},methods:{handleClick(){this.root?k(this.root):r.error("请输入地址")}}});const S={class:"flex flex-col h-full pt-4"},_={class:"flex"},x=p("确定"),A={class:"overflow-auto mt-4"};(j.__cssModules={}).$style={},j.render=function(e,s,a,o,r,p){const f=d,v=h,y=m;return n(),t("div",S,[c("div",_,[c(f,{"addon-before":"mock文件地址",value:e.root,"onUpdate:value":s[1]||(s[1]=t=>e.root=t),placeholder:"请输入地址",onPressEnter:e.handleClick},null,8,["value","onPressEnter"]),c(v,{onClick:e.handleClick},{default:l((()=>[x])),_:1},8,["onClick"])]),c("div",A,[(n(!0),t(i,null,u(e.items,(e=>(n(),t(y,{message:e.message,type:e.type},null,8,["message","type"])))),256))])])};var E=f({routes:[{path:"/",redirect:"/home"},{path:"/home",component:j}],history:v()});const P=y(g);P.use(E),P.use(w),P.mount("#app");
