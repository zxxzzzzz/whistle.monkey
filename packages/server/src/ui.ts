import Koa from 'koa';
import Router from '@koa/router';
// @ts-ignore
import cors from '@koa/cors';
import {watch} from './file/index';
import body from 'koa-body';
// @ts-ignore
import serve from 'koa-better-serve'

const app = new Koa();
const router = new Router();

router.post('/root', async (ctx) => {
  const body = ctx.request.body
  if(!body.path){
    ctx.response.status = 500
    ctx.response.message = 'do not find property "path"'
    return
  }
  await watch(body.path)
  ctx.response.status = 200
})

app.proxy = true;
app.silent = true;
app
  .use(body())
  .use(serve('../uiDist', '/'))
  .use(cors({credentials:true}))
  .use(router.routes())
  .use(router.allowedMethods())




export default (server:any) => {
  server.on('request', app.callback());
};