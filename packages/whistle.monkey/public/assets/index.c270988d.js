import{d as e,c as o,r as t,o as a,a as n,b as s,w as r,I as c,B as u,e as i,f as d,g as l,h as p,A as h}from"./vendor.ed18a4ba.js";var f=e({name:"App"});async function m(e){return async function(e,o){const t=new Request(e,{headers:new Headers({"Content-Type":"application/json"}),body:JSON.stringify(o),method:"post"});try{return(await fetch(t)).json()}catch(a){return}}("/cgi-bin/root",{path:e})}f.render=function(e,n,s,r,c,u){const i=t("router-view");return a(),o(i)};var v=e({name:"App",setup:()=>({root:n("")}),methods:{handleClick(){m(this.root)}}});const y={class:"flex"},b=i("确定");(v.__cssModules={}).$style={},v.render=function(e,t,n,i,d,l){const p=c,h=u;return a(),o("div",y,[s(p,{"addon-before":"mock文件地址",value:e.root,"onUpdate:value":t[1]||(t[1]=o=>e.root=o),placeholder:"请输入地址"},null,8,["value"]),s(h,{onClick:e.handleClick},{default:r((()=>[b])),_:1},8,["onClick"])])};var k=d({routes:[{path:"/",redirect:"/home"},{path:"/home",component:v}],history:l()});const w=p(f);w.use(k),w.use(h),w.mount("#app");