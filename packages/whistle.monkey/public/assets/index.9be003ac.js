import{d as e,c as t,r as a,o as s,a as o,b as n,e as r,P as c,f as l,w as i,I as u,B as d,L as h,g as p,t as m,F as f,h as g,i as v,T as w,_ as y,j as k,m as b,k as _,l as C,n as P,A as S}from"./vendor.32239cec.js";var j=e({name:"App"});async function R(e){return async function(e,t){const a=new Request(e,{headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify(t),method:"post"});try{return(await fetch(a)).json()}catch(s){return}}("/cgi-bin/root",{path:e})}async function L(){return async function(e,t){t&&(e=`${e}?${new URLSearchParams(t).toString()}`);const a=new Request(e,{method:"get"});try{return(await fetch(a)).json()}catch(s){return}}("/cgi-bin/root")}j.render=function(e,o,n,r,c,l){const i=a("router-view");return s(),t(i)};const T=new WebSocket("ws://localhost:9999/ws/log");var x=e({name:"App",setup(){const e=o("");L().then((t=>{e.value=t.path}));const t=n([]);return T.addEventListener("message",(e=>{const a=JSON.parse(e.data);t.push(a)})),{root:e,items:t}},methods:{handleClick(){this.root?R(this.root):r.error("请输入地址")},getTagProp:e=>"命中"===e?{color:"green"}:"添加"===e?{color:"green",icon:c}:void 0,getReadableDate:e=>new Date(e).toLocaleString()}});const A={class:"flex flex-col h-full pt-4"},D={class:"flex"},E=p("确定"),$={class:"overflow-auto mt-4"};(x.__cssModules={}).$style={},x.render=function(e,a,o,n,r,c){const _=u,C=d,P=w,S=y,j=k,R=h;return s(),t("div",A,[l("div",D,[l(_,{"addon-before":"mock文件地址",value:e.root,"onUpdate:value":a[1]||(a[1]=t=>e.root=t),placeholder:"请输入地址",onPressEnter:e.handleClick},null,8,["value","onPressEnter"]),l(C,{onClick:e.handleClick},{default:i((()=>[E])),_:1},8,["onClick"])]),l("div",$,[l(R,{size:"small",bordered:"","data-source":e.items},{renderItem:i((({item:a})=>[l(j,null,{default:i((()=>[l(S,null,{description:i((()=>[l(P,{color:"pink"},{default:i((()=>[p(m(e.getReadableDate(a.date)),1)])),_:2},1024),a.tags?(s(!0),t(f,{key:0},g(a.tags,(a=>(s(),t(P,b(e.getTagProp(a),{key:a}),{default:i((()=>[p(m(a),1)])),_:2},1040)))),128)):v("",!0),l("span",null,m(a.message),1)])),_:2},1024)])),_:2},1024)])),_:1},8,["data-source"])])])};var q=_({routes:[{path:"/",redirect:"/home"},{path:"/home",component:x}],history:C()});const I=P(j);I.use(q),I.use(S),I.mount("#app");
