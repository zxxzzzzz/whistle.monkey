import Koa from 'koa';
import {getRuleByUrl} from '../file/index';

export default (server:any) => {
  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  app.use((ctx) => {
    const href = ctx.request.href
    const rule = getRuleByUrl(href)
    if(rule){
      const sendStr = encodeURIComponent(rule.filePath)
      ctx.body = `* monkey://${sendStr}`
    } else {
      ctx.body = `${href} ${href}`
    }
  })
  server.on('request', app.callback());
};
