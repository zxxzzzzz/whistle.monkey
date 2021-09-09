import Koa from 'koa';
import chokidar from 'chokidar';
import fs from 'fs';
import micromatch from 'micromatch';
import path from 'path';
import YAML from 'js-yaml';
import { addFunction, generate, getValueByStatement } from '@zhangxin/mock-monkey-core';
import findup from 'findup-sync';
import Router from '@koa/router';
import cors from '@koa/cors';
import body from 'koa-body';
import send from 'koa-send';
import { Server } from 'ws';

const store = /*#__PURE__*/new Map();
function addRule(key, rule) {
  var _rule$request;

  if (!rule) {
    throw Error('rule不能为空');
  }

  if (!(rule != null && (_rule$request = rule.request) != null && _rule$request.url)) {
    throw Error('request的url不能为空');
  }

  store.set(key, rule);
}
function updateRule(key, rule) {
  if (!rule) {
    throw Error('rule不能为空');
  }

  const tempRule = store.get(key);

  if (tempRule) {
    store.set(key, { ...tempRule,
      ...rule
    });
    return;
  }

  store.set(key, rule);
}
function deleteRule(key) {
  store.delete(key);
}
function disableRule(key) {
  const tempRule = store.get(key);

  if (tempRule) {
    tempRule.disabled = true;
  }
}
function enableRule(key) {
  const tempRule = store.get(key);

  if (tempRule) {
    tempRule.disabled = false;
  }
}
function getRule(key) {
  return store.get(key);
}
function getRuleByUrl(url) {
  const urlObj = new URL(url);
  const pathNames = urlObj.pathname;
  return [...store.values()].find(rule => {
    return pathNames.includes(rule.request.url);
  });
}
function query(queryList) {
  return micromatch([...store.keys()], queryList);
}

function getValidJson(content, defaultRule) {
  const contentWithoutDocs = content.replace(/\/\/[^\n\r]*/g, '');
  const parsed = JSON.parse(contentWithoutDocs); // 有符合定义的结构体，就不覆盖用户之前输入了

  if (parsed != null && parsed.request) {
    return parsed;
  } // 没有符合定义的结构体，说明试复制来的后端json对象


  return { ...defaultRule,
    response: {
      body: parsed
    }
  };
} // 处理非法的yaml格式


async function handleInvalidYaml(store) {
  const {
    _path,
    eventName
  } = store;
  const parsedPath = path.parse(_path);
  if (!['add', 'change'].includes(eventName)) return 'next';
  if (parsedPath.ext !== '.yaml') return 'next';
  let parsedJSON = {
    request: {
      url: path.parse(_path).name,
      body: {}
    },
    response: {
      body: {}
    }
  };
  const content = fs.readFileSync(_path, {
    encoding: 'utf-8'
  }); // 文件内容为空，初始化一个模板

  if (content === '') {
    fs.writeFileSync(_path, YAML.dump({ ...parsedJSON
    }), {
      encoding: 'utf-8'
    });
    return;
  }

  try {
    // 如果输入的是合法json,把他变成yaml格式
    const obj = getValidJson(content, parsedJSON);
    fs.writeFileSync(_path, YAML.dump(obj), {
      encoding: 'utf-8'
    });
    return;
  } catch (error) {}

  try {
    store.rule = YAML.load(content);
    return 'next';
  } catch (error) {
    // 如果yaml格式化失败，发送问题到log
    global.sendLog({
      message: `${_path}文件有格式问题<span class="text-pink-500">${error.message}</span>`,
      type: 'error',
      tags: ['yaml', '格式']
    });
  }

  return;
}

async function handleJSFile(store) {
  const {
    _path,
    eventName
  } = store;
  const parsedPath = path.parse(_path);
  if (parsedPath.ext !== '.js' || !['add', 'change'].includes(eventName)) return 'next';
  const i18n = {
    add: '添加',
    change: '更新',
    unlinkDir: '',
    unlink: '',
    addDir: ''
  };

  try {
    if (eventName === 'change') delete require.cache[_path];

    const mod = require(_path);

    Object.keys(mod).forEach(key => {
      addFunction(key, mod[key]);
    });
    global.sendLog({
      message: `${i18n[eventName]}了函数<span class="text-pink-500">${_path}</span>`,
      type: 'success',
      tags: ['添加', '函数']
    });
  } catch (error) {
    global.sendLog({
      message: `${i18n[eventName]}函数<span class="text-pink-500">${_path}</span>失败，${error.message}`,
      type: 'success',
      tags: ['添加', '函数']
    });
  }

  return;
}

function getIgnoreRules(dir, root) {
  const ignoreFilePath = findup('.ignore', {
    cwd: dir
  });
  let ignoreRules = [];

  if (ignoreFilePath) {
    ignoreRules = fs.readFileSync(ignoreFilePath, {
      encoding: 'utf-8'
    }).split('\n').filter(text => !text.startsWith('// ')).map(text => {
      const prefixPath = `${path.parse(ignoreFilePath.replace(/[\\]/g, '/')).dir}`.replace(root, '**');
      return `${prefixPath}/${text.replace(/[\s]*/g, '')}`;
    });
  }

  return ignoreRules;
}

async function handleYAMLFile(store) {
  const {
    _path,
    eventName,
    root
  } = store;
  const parsedPath = path.parse(_path);
  if (parsedPath.ext !== '.yaml') return 'next';

  if (eventName === 'add') {
    try {
      addRule(_path, { ...store.rule,
        filePath: _path,
        disabled: false
      });
      const ignoreRules = getIgnoreRules(parsedPath.dir, root);

      if (micromatch.isMatch(_path, ignoreRules)) {
        disableRule(_path);
        global.sendLog({
          message: `禁用了模板<span class="text-pink-500">${_path}</span>`,
          type: 'warning',
          tags: ['禁用']
        });
        return;
      }

      global.sendLog({
        message: `添加了模板<span class="text-pink-500">${_path}</span>`,
        type: 'success',
        tags: ['添加']
      });
    } catch (error) {
      global.sendLog({
        message: `添加模板<span class="text-pink-500">${_path}</span>失败,${error.message}`,
        type: 'error'
      });
    }
  }

  if (eventName === 'change') {
    try {
      updateRule(_path, store.rule);
      global.sendLog({
        message: `更新了模板<span class="text-pink-500">${_path}</span>`,
        type: 'success',
        tags: ['更新']
      });
    } catch (error) {
      global.sendLog({
        message: `更新模板<span class="text-pink-500">${_path}</span>失败`,
        type: 'error'
      });
    }
  }

  if (eventName === 'unlinkDir') {
    query([`${_path}/*`]).forEach(filePath => {
      deleteRule(filePath);
      global.sendLog({
        message: `删除了模板<span class="text-pink-500">${_path}</span>`,
        type: 'warning',
        tags: ['禁用']
      });
    });
  }

  if (eventName === 'unlink') {
    deleteRule(_path);
    global.sendLog({
      message: `删除了模板<span class="text-pink-500">${_path}</span>`,
      type: 'success',
      tags: ['删除']
    });
  }

  return;
}

async function handleIgnore(store) {
  const {
    _path,
    root
  } = store;
  const parsedPath = path.parse(_path);

  if (parsedPath.name === '.ignore') {
    const ignoreRules = getIgnoreRules(parsedPath.dir, root);
    query(['**']).forEach(filePath => {
      const rule = getRule(filePath);

      if ((rule == null ? void 0 : rule.disabled) === true && !micromatch.isMatch(filePath, ignoreRules)) {
        enableRule(filePath);
        global.sendLog({
          message: `启用了模板<span class="text-pink-500">${filePath}</span>`,
          type: 'success',
          tags: ['启用']
        });
        return;
      }

      if ((rule == null ? void 0 : rule.disabled) === false && micromatch.isMatch(filePath, ignoreRules)) {
        disableRule(filePath);
        global.sendLog({
          message: `禁用了模板<span class="text-pink-500">${filePath}</span>`,
          type: 'warning',
          tags: ['禁用']
        });
      }
    });
  }
}

let currentWatcher;
async function watch(watchPath) {
  if (currentWatcher) {
    await currentWatcher.close();
  }

  if (!fs.existsSync(watchPath)) throw Error('path not exist');
  currentWatcher = chokidar.watch(watchPath).on('all', (eventName, _path) => {
    queue([handleInvalidYaml, handleJSFile, handleYAMLFile, handleIgnore], {
      eventName,
      _path: _path.replace(/[\\]/g, '/'),
      root: watchPath.replace(/[\\]/g, '/'),
      content: ''
    });
  });
}

async function queue(funcs, params) {
  if (!funcs.length) return;
  const store = params;

  for (const func of funcs) {
    const flag = await func(store);

    if (flag !== 'next') {
      break;
    }
  }
}

var rulesServer = (server => {
  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  app.use(ctx => {
    const href = ctx.request.href;
    const rule = getRuleByUrl(href);

    if (rule && rule.disabled === false) {
      const sendStr = encodeURIComponent(rule.filePath);
      ctx.body = `* monkey://${sendStr}`;
    } else {
      ctx.body = `${href} ${href}`;
    }
  });
  server.on('request', app.callback());
});

// 跨域设置
function handleCors(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', request.headers['origin'] || '');
  response.setHeader('Content-Type', 'application/json');
  return 'next';
}

function handleDefault(request, response, rule, requestData) {
  var _rule$response;

  const filePath = decodeURIComponent(request.originalReq.ruleValue);
  const body = generate(rule == null ? void 0 : (_rule$response = rule.response) == null ? void 0 : _rule$response.body, requestData);
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  response.end(JSON.stringify(body), 'utf-8');
  global.sendLog({
    type: 'success',
    message: `请求<span class="text-purple-500">${url.pathname}</span>命中文件<span class="text-pink-500">${filePath}</span>`,
    tags: ['命中']
  });
}

function handleDelay(request, response, rule, requestData) {
  if (typeof (rule == null ? void 0 : rule.delay) === 'number') {
    var _rule$response;

    const body = generate(rule == null ? void 0 : (_rule$response = rule.response) == null ? void 0 : _rule$response.body, requestData);
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const filePath = decodeURIComponent(request.originalReq.ruleValue);
    setTimeout(() => {
      response.end(JSON.stringify(body), 'utf-8');
      global.sendLog({
        type: 'success',
        message: `请求<span class="text-purple-500">${url.pathname}
          </span>延迟${rule.delay}ms, 命中文件<span class="text-pink-500">${filePath}</span>`,
        tags: ['命中']
      });
    }, rule.delay);
    return;
  }

  return 'next';
}

function isEqual(statement, val, scope) {
  const result = getValueByStatement(statement, scope);

  try {
    if (typeof result === 'function') {
      result(val);
    }
  } catch (error) {
    throw Error(`${result.name} 方法出错， ${error.message}`);
  }

  return val === result;
} // 根据多数接口调查，request body一般就一层结构，所以做个简单的，只遍历第一层的


function isValid(father, child, scope) {
  if (child == null) {
    return true;
  }

  if (father == null) {
    throw Error('入参不存在，但是却配置了入参验证, 所以请求失败');
  }

  Object.keys(child).forEach(key => {
    const cv = child[key];
    const fv = father[key];
    const bo = isEqual(cv, fv, scope);

    if (bo === false) {
      throw Error(`入参字段 ${key} 不符合判定规则`);
    }
  });
  return true;
}

function handleRequestDataMatch(request, response, rule, requestData) {
  try {
    var _rule$request;

    isValid(requestData, rule == null ? void 0 : (_rule$request = rule.request) == null ? void 0 : _rule$request.body, requestData);
  } catch (error) {
    response.statusCode = 400;
    response.statusMessage = error.message;
    response.end(JSON.stringify({
      code: 400,
      message: error.message
    }), 'utf-8');
    const filePath = decodeURIComponent(request.originalReq.ruleValue);
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    global.sendLog({
      type: 'error',
      message: `请求<span class="text-purple-500">${url.pathname}</span>命中文件<span class="text-pink-500">${filePath}</span>,但是参数有问题`,
      tags: ['命中', '入参']
    });
    return;
  }

  return 'next';
}

const NEXT = 'next';
var server = (server => {
  server.on('request', (req, res) => {
    const filePath = decodeURIComponent(req.originalReq.ruleValue);
    const rule = getRule(filePath);

    if (filePath) {
      let data = '';
      req.on('data', chunk => {
        data += chunk.toString('utf-8');
      });
      req.on('end', () => {
        if (!data) {
          data = '{}';
        }

        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const queryData = {};
          url.searchParams.forEach((val, key) => {
            queryData[key] = val;
          });
          const requestData = { ...JSON.parse(data),
            ...queryData
          };
          queue$1([handleCors, handleRequestDataMatch, handleDelay, handleDefault], [req, res, rule, requestData]);
        } catch (error) {
          res.setHeader('Content-Type', 'text/plain');
          res.end(error.message, 'utf-8');
          console.log(error);
        }
      });
    }
  });
});

function queue$1(items, params) {
  let isBreak = false;
  items.forEach(func => {
    if (!isBreak) {
      isBreak = func(...params) === NEXT ? false : true;
    }
  });
}

const app = /*#__PURE__*/new Koa();
const router = /*#__PURE__*/new Router();
router.post('/cgi-bin/root', async ctx => {
  const body = ctx.request.body;

  if (!body.path) {
    ctx.response.status = 500;
    ctx.response.message = 'do not find property "path"';
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync('./config.json', {
      encoding: 'utf-8'
    }));
    config.root = body.path;
    fs.writeFileSync('./config.json', JSON.stringify(config), {
      encoding: 'utf-8'
    });
    await watch(body.path);
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify({
      path: body.path
    });
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.message = error.message;
  }
});
router.get('/cgi-bin/root', async ctx => {
  const {
    root
  } = JSON.parse(fs.readFileSync('./config.json', {
    encoding: 'utf-8'
  }));
  ctx.response.status = 200;
  ctx.response.body = JSON.stringify({
    path: root
  });
});
app.proxy = true;
app.silent = true;
app.use(body()).use(cors({
  credentials: true
})).use(router.routes()).use(router.allowedMethods()).use(async ctx => {
  const root = path.resolve(__dirname, '../public');
  const parsedPath = path.parse(ctx.path);

  if (ctx.path === '/plugin.monkey/') {
    await send(ctx, './index.html', {
      root
    });
    return;
  }

  if (parsedPath.ext !== '') {
    const isExist = fs.existsSync(`${root}${ctx.path}`);

    if (isExist) {
      await send(ctx, `.${ctx.path}`, {
        root
      });
      return;
    }

    ctx.response.status = 500;
    ctx.response.message = 'file not found';
    return;
  }

  await send(ctx, './index.html', {
    root
  });
});
let hasInit = false;
var ui = (server => {
  if (!fs.existsSync('./config.json')) {
    fs.writeFileSync('./config.json', JSON.stringify({
      root: ''
    }), {
      encoding: 'utf-8'
    });
  }

  server.on('request', app.callback());
  const wss = new Server({
    port: 9999
  });
  wss.on('connection', async function (_ws) {
    global.sendLog = log => {
      if (!log.date) {
        log.date = new Date().valueOf();
      }

      _ws.send(JSON.stringify(log));
    };

    if (!hasInit) {
      const {
        root
      } = JSON.parse(fs.readFileSync('./config.json', {
        encoding: 'utf-8'
      }));

      if (root) {
        try {
          await watch(root);
        } catch (error) {
          sendLog({
            type: 'error',
            message: error.message,
            tags: ['路径']
          });
        }

        hasInit = true;
      }
    }
  });
});

export { rulesServer, server, ui as uiServer };
//# sourceMappingURL=whistle.monkey.esm.js.map
