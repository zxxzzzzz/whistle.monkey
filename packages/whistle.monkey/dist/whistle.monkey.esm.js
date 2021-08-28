import Koa from 'koa';
import chokidar from 'chokidar';
import fs from 'fs';
import YAML from 'js-yaml';
import path from 'path';
import micromatch from 'micromatch';
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

let currentWatcher;
async function watch(watchPath) {
  if (currentWatcher) {
    await currentWatcher.close();
  }

  if (!fs.existsSync(watchPath)) throw Error('path not exist');
  currentWatcher = chokidar.watch(watchPath).on('all', (eventName, _path) => {
    queue([handleJSFile, handleYAMLFile, handleIgnore], [eventName, _path.replace(/[\\]/g, '/'), watchPath.replace(/[\\]/g, '/')]);
  });
}

function getObjFromYAML(filePath) {
  let parsedJSON = {
    request: {
      url: '',
      body: {}
    },
    response: {
      body: {}
    }
  };

  try {
    const content = fs.readFileSync(filePath, {
      encoding: 'utf-8'
    });
    const parsedYaml = YAML.load(content);
    if (!parsedYaml) throw Error('文件内容不能为空'); // 把合法的json转换为合法yaml

    if (!parsedYaml.request) {
      parsedJSON = formatJsonToYAML(content);
      fs.writeFileSync(filePath, YAML.dump({ ...parsedJSON
      }), {
        encoding: 'utf-8'
      });
      return parsedJSON;
    }

    return parsedYaml;
  } catch (error) {
    console.log(error);
    fs.writeFileSync(filePath, YAML.dump(parsedJSON), {
      encoding: 'utf-8'
    });
    return {};
  }
} // 把json转换为yaml。不catch错误。


function formatJsonToYAML(content) {
  const contentWithoutDocs = content.replace(/\/\/[\s\S]*/g, '');
  console.log(contentWithoutDocs, 'contentWithoutDocs');
  const parsed = JSON.parse(contentWithoutDocs); // 有符合定义的结构体，就不覆盖用户之前输入了

  if (parsed != null && parsed.request) {
    return {};
  } // 没有符合定义的结构体，说明试复制来的后端json对象


  return {
    request: {
      url: '',
      body: {}
    },
    response: {
      body: parsed
    }
  };
}

function addFile(filePath) {
  addRule(filePath, { ...getObjFromYAML(filePath),
    filePath,
    disabled: false
  });
}

function updateFile(filePath) {
  addRule(filePath, getObjFromYAML(filePath));
}

function deleteFile(filePath) {
  deleteRule(filePath);
}

async function queue(funcs, params) {
  for (const func of funcs) {
    await func(...params);
  }
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

async function handleJSFile(eventName, _path) {
  const parsedPath = path.parse(_path);

  if (parsedPath.ext === '.js' && ['add', 'change'].includes(eventName)) {
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
        date: new Date().valueOf(),
        type: 'success',
        tags: ['添加', '函数']
      });
    } catch (error) {
      global.sendLog({
        message: `${i18n[eventName]}函数<span class="text-pink-500">${_path}</span>失败，${error.message}`,
        date: new Date().valueOf(),
        type: 'success',
        tags: ['添加', '函数']
      });
    }
  }
}

async function handleYAMLFile(eventName, _path, root) {
  const parsedPath = path.parse(_path);
  if (parsedPath.ext !== '.yaml') return;

  if (eventName === 'add') {
    try {
      addFile(_path);
      const ignoreRules = getIgnoreRules(parsedPath.dir, root);

      if (micromatch.isMatch(_path, ignoreRules)) {
        disableRule(_path);
        global.sendLog({
          message: `禁用了模板<span class="text-pink-500">${_path}</span>`,
          date: new Date().valueOf(),
          type: 'warning',
          tags: ['禁用']
        });
        return;
      }

      global.sendLog({
        message: `添加了模板<span class="text-pink-500">${_path}</span>`,
        date: new Date().valueOf(),
        type: 'success',
        tags: ['添加']
      });
    } catch (error) {
      global.sendLog({
        message: `添加模板<span class="text-pink-500">${_path}</span>失败,${error.message}`,
        date: new Date().valueOf(),
        type: 'error'
      });
    }
  }

  if (eventName === 'change') {
    try {
      updateFile(_path);
      global.sendLog({
        date: new Date().valueOf(),
        message: `更新了模板<span class="text-pink-500">${_path}</span>`,
        type: 'success',
        tags: ['更新']
      });
    } catch (error) {
      global.sendLog({
        message: `更新模板<span class="text-pink-500">${_path}</span>失败`,
        date: new Date().valueOf(),
        type: 'error'
      });
    }
  }

  if (eventName === 'unlinkDir') {
    query([`${_path}/*`]).forEach(filePath => {
      deleteRule(filePath);
      global.sendLog({
        message: `禁用了模板<span class="text-pink-500">${_path}</span>`,
        date: new Date().valueOf(),
        type: 'warning',
        tags: ['禁用']
      });
    });
  }

  if (eventName === 'unlink') {
    deleteFile(_path);
    global.sendLog({
      date: new Date().valueOf(),
      message: `删除了模板<span class="text-pink-500">${_path}</span>`,
      type: 'success',
      tags: ['删除']
    });
  }
}

async function handleIgnore(_eventName, _path, root) {
  const parsedPath = path.parse(_path);

  if (parsedPath.name === '.ignore') {
    const ignoreRules = getIgnoreRules(parsedPath.dir, root);
    query(['**']).forEach(filePath => {
      const rule = getRule(filePath);

      if ((rule == null ? void 0 : rule.disabled) === true && !micromatch.isMatch(filePath, ignoreRules)) {
        enableRule(filePath);
        global.sendLog({
          message: `启用了模板<span class="text-pink-500">${filePath}</span>`,
          date: new Date().valueOf(),
          type: 'success',
          tags: ['启用']
        });
        return;
      }

      if ((rule == null ? void 0 : rule.disabled) === false && micromatch.isMatch(filePath, ignoreRules)) {
        disableRule(filePath);
        global.sendLog({
          message: `禁用了模板<span class="text-pink-500">${filePath}</span>`,
          date: new Date().valueOf(),
          type: 'warning',
          tags: ['禁用']
        });
      }
    });
  }
}

var rulesServer = (server => {
  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  app.use(ctx => {
    const href = ctx.request.href;
    const rule = getRuleByUrl(href);

    if (rule) {
      const sendStr = encodeURIComponent(rule.filePath);
      ctx.body = `* monkey://${sendStr}`;
    } else {
      ctx.body = `${href} ${href}`;
    }
  });
  server.on('request', app.callback());
});

function isMatch(statement, val, scope) {
  const result = getValueByStatement(statement, scope);

  if (typeof result === 'function') {
    return result(val);
  }

  return val === result;
}

function isContain(father, child, scope) {
  if (!child) return true;
  if (father === child) return true;

  if (typeof child === 'string') {
    return isMatch(child, father, scope);
  }

  if (typeof father !== 'object' || typeof child !== 'object') return false;

  if (Array.isArray(father) && Array.isArray(child)) {
    child.every(i => {
      if (typeof i !== 'object') return father.includes(i);
      return father.some(fj => {
        isContain(fj, i, scope);
      });
    });
  }

  return Object.keys(child).every(childKey => {
    const childItem = child[childKey];
    const fatherItem = father[childKey];
    if (!fatherItem) return false;
    return isContain(fatherItem, childItem, scope);
  });
}
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
          var _rule$request, _rule$response;

          const url = new URL(req.url, `http://${req.headers.host}`);
          const queryData = {};
          url.searchParams.forEach((val, key) => {
            queryData[key] = val;
          });
          const requestData = { ...JSON.parse(data),
            ...queryData
          };
          const isFileMatch = isContain(requestData, rule == null ? void 0 : (_rule$request = rule.request) == null ? void 0 : _rule$request.body, requestData);

          if (!isFileMatch) {
            req.passThrough();
            return;
          }

          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Origin', req.headers['origin']);
          res.setHeader('Content-Type', 'application/json');
          const body = generate(rule == null ? void 0 : (_rule$response = rule.response) == null ? void 0 : _rule$response.body, requestData); // if (typeof template.delay === 'number') {
          //   setTimeout(() => {
          //     res.end(JSON.stringify(body), 'utf-8');
          //   }, template.delay);
          //   return;
          // }

          res.end(JSON.stringify(body), 'utf-8');
          global.sendLog({
            type: 'success',
            message: `请求<span class="text-purple-500">${url.pathname}</span>命中文件<span class="text-pink-500">${filePath}</span>`,
            date: new Date().valueOf(),
            tags: ['命中']
          });
        } catch (error) {
          res.setHeader('Content-Type', 'text/plain');
          res.end(error.message, 'utf-8');
          console.log(error);
        }
      });
    }
  });
});

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
  wss.on('connection', function (_ws) {
    global.sendLog = log => {
      _ws.send(JSON.stringify(log));
    };

    if (!hasInit) {
      const {
        root
      } = JSON.parse(fs.readFileSync('./config.json', {
        encoding: 'utf-8'
      }));

      if (root) {
        watch(root);
        hasInit = true;
      }
    }
  });
});

export { rulesServer, server, ui as uiServer };
//# sourceMappingURL=whistle.monkey.esm.js.map
