import Koa from 'koa';
import Router from '@koa/router';
// @ts-ignore
import cors from '@koa/cors';
import { watch } from '../file/index';
import body from 'koa-body';
import send from 'koa-send';
import path from 'path';
import fs from 'fs';
// @ts-ignore
import { Server } from 'ws';
import { Log } from '../interface/log';

const app = new Koa();
const router = new Router();

router.post('/cgi-bin/root', async ctx => {
  const body = ctx.request.body;
  if (!body.path) {
    ctx.response.status = 500;
    ctx.response.message = 'do not find property "path"';
    return;
  }
  try {
    const config = JSON.parse(
      fs.readFileSync('./config.json', { encoding: 'utf-8' })
    );
    config.root = body.path;
    fs.writeFileSync('./config.json', JSON.stringify(config), {
      encoding: 'utf-8',
    });
    await watch(body.path);
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify({ path: body.path });
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.message = error.message;
  }
});
router.get('/cgi-bin/root', async ctx => {
  const { root } = JSON.parse(
    fs.readFileSync('./config.json', { encoding: 'utf-8' })
  );
  ctx.response.status = 200;
  ctx.response.body = JSON.stringify({ path: root });
});

app.proxy = true;
app.silent = true;
app
  .use(body())
  .use(cors({ credentials: true }))
  .use(router.routes())
  .use(router.allowedMethods())
  .use(async ctx => {
    const root = path.resolve(__dirname, '../public');
    const parsedPath = path.parse(ctx.path);
    if (ctx.path === '/plugin.monkey/') {
      await send(ctx, './index.html', { root });
      return;
    }
    if (parsedPath.ext !== '') {
      const isExist = fs.existsSync(`${root}${ctx.path}`);
      if (isExist) {
        await send(ctx, `.${ctx.path}`, { root });
        return;
      }
      ctx.response.status = 500;
      ctx.response.message = 'file not found';
      return;
    }
    await send(ctx, './index.html', { root });
  });

let hasInit = false;
export default (server: any) => {
  if (!fs.existsSync('./config.json')) {
    fs.writeFileSync('./config.json', JSON.stringify({ root: '' }), {
      encoding: 'utf-8',
    });
  }
  server.on('request', app.callback());
  const wss = new Server({ port: 9999 });
  wss.on('connection', async function(_ws: any) {
    global.sendLog = (log: Log) => {
      _ws.send(JSON.stringify(log));
    };
    if (!hasInit) {
      const { root } = JSON.parse(
        fs.readFileSync('./config.json', { encoding: 'utf-8' })
      );
      if (root) {
        try {
          await watch(root);
        } catch (error) {
          sendLog({
            type: 'error',
            message: error.message,
            date: new Date().valueOf(),
            tags: ['路径'],
          });
        }
        hasInit = true;
      }
    }
  });
};
