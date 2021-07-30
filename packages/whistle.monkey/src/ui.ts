import Koa from 'koa';
import Router from '@koa/router';
// @ts-ignore
import cors from '@koa/cors';
import { watch } from './file/index';
import body from 'koa-body';
import send from 'koa-send';
import path from 'path';
import fs from 'fs';
// @ts-ignore
import { Server } from 'ws';
import { Log } from './interface/log';

const app = new Koa();
const router = new Router();


router.post('/cgi-bin/root', async (ctx) => {
  const body = ctx.request.body;
  if (!body.path) {
    ctx.response.status = 500;
    ctx.response.message = 'do not find property "path"';
    return;
  }
  try {
    await watch(body.path);
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify({path:body.path})
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.message = error.message;
  }
});

app.proxy = true;
app.silent = true;
app
  .use(body())
  .use(cors({ credentials: true }))
  .use(router.routes())
  .use(router.allowedMethods())
  .use(async (ctx) => {
    const root = path.resolve(__dirname, '../public')
    const parsedPath = path.parse(ctx.path);
    if (ctx.path === '/plugin.monkey/') {
      await send(ctx, './index.html',{ root });
      return;
    }
    if (parsedPath.ext !== '') {
      const isExist = fs.existsSync(`${root}${ctx.path}`);
      if (isExist) {
        await send(ctx, `.${ctx.path}`, {root});
        return;
      }
      ctx.response.status = 500;
      ctx.response.message = 'file not found';
      return;
    }
    await send(ctx, './index.html', {root});
  })

export default (server: any) => {
  server.on('request', app.callback());
  const wss = new Server({ port: 9999 });
  wss.on('connection', function(_ws:any) {
    global.sendLog = (log:Log) => {
      _ws.send(JSON.stringify(log))
    }
  });
};
