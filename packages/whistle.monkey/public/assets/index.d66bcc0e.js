import{d as e,c as t,r as a,o as s,a as n,b as o,e as r,f as c,w as l,I as i,B as u,L as d,g as h,t as p,F as f,h as m,i as g,T as v,_ as w,j as y,m as k,k as b,l as _,n as C,A as S}from"./vendor.7fd9aedb.js";var j=e({name:"App"});async function P(e){return async function(e,t){const a=new Request(e,{headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify(t),method:"post"});try{return(await fetch(a)).json()}catch(s){return}}("/cgi-bin/root",{path:e})}async function R(){return async function(e,t){t&&(e=`${e}?${new URLSearchParams(t).toString()}`);const a=new Request(e,{method:"get"});try{return(await fetch(a)).json()}catch(s){return}}("/cgi-bin/root")}j.render=function(e,n,o,r,c,l){const i=a("router-view");return s(),t(i)};const L=new WebSocket("ws://localhost:9999/ws/log");var T=e({name:"App",setup(){const e=n("");R().then((t=>{e.value=t.path}));const t=o([]);return L.addEventListener("message",(e=>{const a=JSON.parse(e.data);t.push(a)})),{root:e,items:t}},methods:{handleClick(){this.root?P(this.root):r.error("请输入地址")},getTagProp(e){if("命中"===e)return{color:"green"}},getReadableDate:e=>new Date(e).toLocaleString()}});const x={class:"flex flex-col h-full pt-4"},A={class:"flex"},D=h("确定"),E={class:"overflow-auto mt-4"};(T.__cssModules={}).$style={},T.render=function(e,a,n,o,r,b){const _=i,C=u,S=v,j=w,P=y,R=d;return s(),t("div",x,[c("div",A,[c(_,{"addon-before":"mock文件地址",value:e.root,"onUpdate:value":a[1]||(a[1]=t=>e.root=t),placeholder:"请输入地址",onPressEnter:e.handleClick},null,8,["value","onPressEnter"]),c(C,{onClick:e.handleClick},{default:l((()=>[D])),_:1},8,["onClick"])]),c("div",E,[c(R,{size:"small",bordered:"","data-source":e.items},{renderItem:l((({item:a})=>[c(P,null,{default:l((()=>[c(j,null,{description:l((()=>[c(S,{color:"pink"},{default:l((()=>[h(p(e.getReadableDate(a.date)),1)])),_:2},1024),a.tags?(s(!0),t(f,{key:0},m(a.tags,(a=>(s(),t(S,k(e.getTagProp(a),{key:a}),null,16)))),128)):g("",!0),c("span",null,p(a.message),1)])),_:2},1024)])),_:2},1024)])),_:1},8,["data-source"])])])};var $=b({routes:[{path:"/",redirect:"/home"},{path:"/home",component:T}],history:_()});const q=C(j);q.use($),q.use(S),q.mount("#app");
