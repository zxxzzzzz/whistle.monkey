import{d as e,c as n,r as o,o as s,a as t,b as a,w as r,F as c,I as l,B as d,e as i,f as u,g as p,h,A as f}from"./vendor.8a6d4df1.js";var m=e({name:"App"});async function v(e){return async function(e,n){const o=new Request(e,{headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify(n),method:"post"});try{return(await fetch(o)).json()}catch(s){return}}("/cgi-bin/root",{path:e})}m.render=function(e,t,a,r,c,l){const d=o("router-view");return s(),n(d)};const w=new WebSocket("ws://local.whistlejs.com/ws/log");var y=e({name:"App",setup:()=>(w.addEventListener("open",(function(e){w.send("Hello Server!")})),w.addEventListener("message",(function(e){console.log("Message from server ",e.data)})),{root:t("")}),methods:{handleClick(){v(this.root)}}});const g={class:"flex"},k=i("确定"),b=a("div",null,null,-1);(y.__cssModules={}).$style={},y.render=function(e,o,t,i,u,p){const h=l,f=d;return s(),n(c,null,[a("div",g,[a(h,{"addon-before":"mock文件地址",value:e.root,"onUpdate:value":o[1]||(o[1]=n=>e.root=n),placeholder:"请输入地址"},null,8,["value"]),a(f,{onClick:e.handleClick},{default:r((()=>[k])),_:1},8,["onClick"])]),b],64)};var C=u({routes:[{path:"/",redirect:"/home"},{path:"/home",component:y}],history:p()});const j=h(m);j.use(C),j.use(f),j.mount("#app");
