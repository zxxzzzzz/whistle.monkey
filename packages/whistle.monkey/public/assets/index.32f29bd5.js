import{d as e,c as t,r as a,o,a as s,b as n,e as r,C as c,P as l,f as i,w as u,I as d,B as p,L as h,g as m,t as f,F as g,h as v,T as w,_ as y,i as k,j as b,k as C,l as _,m as S,n as j,A as R}from"./vendor.10007602.js";var L=e({name:"App"});async function P(e){return async function(e,t){const a=new Request(e,{headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify(t),method:"post"});try{return(await fetch(a)).json()}catch(o){return}}("/cgi-bin/root",{path:e})}async function x(){return async function(e,t){t&&(e=`${e}?${new URLSearchParams(t).toString()}`);const a=new Request(e,{method:"get"});try{return(await fetch(a)).json()}catch(o){return}}("/cgi-bin/root")}L.render=function(e,s,n,r,c,l){const i=a("router-view");return o(),t(i)};const A=new WebSocket("ws://localhost:9999/ws/log");var D=e({name:"App",setup(){const e=s("");x().then((t=>{e.value=t.path}));const t=n([]);return A.addEventListener("message",(e=>{const a=JSON.parse(e.data);a.tagsComponents=(a.tags||[]).map((e=>function(e){return"命中"===e?{color:"green",tag:e,icon:c}:"添加"===e?{color:"green",icon:l,tag:e}:void 0}(e))),t.push(a)})),{root:e,items:t}},methods:{handleClick(){this.root?P(this.root):r.error("请输入地址")},getReadableDate:e=>new Date(e).toLocaleString()}});const E={class:"flex flex-col h-full pt-4"},$={class:"flex"},q=m("确定"),I={class:"overflow-auto mt-4"};(D.__cssModules={}).$style={},D.render=function(e,a,s,n,r,c){const l=d,_=p,S=w,j=y,R=k,L=h;return o(),t("div",E,[i("div",$,[i(l,{"addon-before":"mock文件地址",value:e.root,"onUpdate:value":a[1]||(a[1]=t=>e.root=t),placeholder:"请输入地址",onPressEnter:e.handleClick},null,8,["value","onPressEnter"]),i(_,{onClick:e.handleClick},{default:u((()=>[q])),_:1},8,["onClick"])]),i("div",I,[i(L,{size:"small",bordered:"","data-source":e.items},{renderItem:u((({item:a})=>[i(R,null,{default:u((()=>[i(j,null,{description:u((()=>[i(S,{color:"pink"},{default:u((()=>[m(f(e.getReadableDate(a.date)),1)])),_:2},1024),(o(!0),t(g,null,v(a.tagsComponents,(e=>(o(),t(S,{color:e.color,key:e.tag},{default:u((()=>[m(f(e.tag),1),e.icon?(o(),t(b(e.icon),{key:0,class:"align-middle"})):C("",!0)])),_:2},1032,["color"])))),128)),i("span",null,f(a.message),1)])),_:2},1024)])),_:2},1024)])),_:1},8,["data-source"])])])};var J=_({routes:[{path:"/",redirect:"/home"},{path:"/home",component:D}],history:S()});const N=j(L);N.use(J),N.use(R),N.mount("#app");
