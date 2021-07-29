import Koa from 'koa';
import Router from '@koa/router';
// @ts-ignore
import cors from '@koa/cors';
import { watch } from './file/index';
import body from 'koa-body';
import send from 'koa-send';
import path from 'path';
import fs from 'fs';

const app = new Koa();
const router = new Router();

router.post('/root', async ctx => {
  const body = ctx.request.body;
  if (!body.path) {
    ctx.response.status = 500;
    ctx.response.message = 'do not find property "path"';
    return;
  }
  await watch(body.path);
  ctx.response.status = 200;
});

app.proxy = true;
app.silent = true;
app
  .use(body())
  .use(async ctx => {
    const root = path.resolve(__dirname, '../public').slice(0,-1)
    const parsedPath = path.parse(ctx.path);
    if (ctx.path === '/plugin.monkey/') {
      await send(ctx, 'index.html',{ root });
      return;
    }
    if (parsedPath.ext !== '') {
      console.log(`${root}/${ctx.path}`, 123);
      const isExist = fs.existsSync(`${root}/${ctx.path}`);
      if (isExist) {
        await send(ctx, ctx.path, {root});
        return;
      }
      ctx.response.status = 500;
      ctx.response.message = 'file not found';
      return;
    }
    await send(ctx, 'index.html', {root});
  })
  .use(cors({ credentials: true }))
  .use(router.routes())
  .use(router.allowedMethods());

export default (server: any) => {
  server.on('request', app.callback());
};
