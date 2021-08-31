import { getRule } from '../file/index';
import { generate, getValueByStatement } from '@zhangxin/mock-monkey-core';
import { Rule } from '../file/interface';
import http from 'http';

interface Request {
  originalReq: {
    ruleValue: string;
  };
  passThrough: () => {};
}

const NEXT = 'next';

function isMatch(statement: string, val: any, scope: any) {
  const result = getValueByStatement(statement, scope);
  if (typeof result === 'function') {
    return result(val);
  }
  return val === result;
}

export function isContain(father: any, child: any, scope: any): boolean {
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

export default (server: http.Server) => {
  server.on(
    'request',
    (req: http.IncomingMessage & Request, res: http.OutgoingMessage) => {
      const filePath = decodeURIComponent(req.originalReq.ruleValue);
      const rule = getRule(filePath);
      if (filePath) {
        let data = '';
        req.on('data', (chunk: any) => {
          data += chunk.toString('utf-8');
        });
        req.on('end', () => {
          if (!data) {
            data = '{}';
          }
          try {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const queryData: { [key: string]: any } = {};
            url.searchParams.forEach((val, key) => {
              queryData[key] = val;
            });
            const requestData = { ...JSON.parse(data), ...queryData };
            queue(
              [handleRequestDataMatch, handleDelay, handleDelay, handleDefault],
              [req, res, rule, requestData]
            );
            global.sendLog({
              type: 'success',
              message: `请求<span class="text-purple-500">${url.pathname}</span>命中文件<span class="text-pink-500">${filePath}</span>`,
              date: new Date().valueOf(),
              tags: ['命中'],
            });
          } catch (error) {
            res.setHeader('Content-Type', 'text/plain');
            res.end(error.message, 'utf-8');
            console.log(error);
          }
        });
      }
    }
  );
};

function handleDelay(
  request: http.IncomingMessage & Request,
  response: http.OutgoingMessage,
  rule: Rule,
  requestData: any
) {
  if (typeof rule?.delay === 'number') {
    const body = generate(rule?.response?.body, requestData);
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const filePath = decodeURIComponent(request.originalReq.ruleValue);
    setTimeout(() => {
      response.end(JSON.stringify(body), 'utf-8');
      global.sendLog({
        type: 'success',
        message: `请求<span class="text-purple-500">${url.pathname}
          </span>延迟${rule.delay}ms, 命中文件<span class="text-pink-500">${filePath}</span>`,
        date: new Date().valueOf(),
        tags: ['命中'],
      });
    }, rule.delay);
    return;
  }
  return NEXT;
}

function handleCors(
  request: http.IncomingMessage & Request,
  response: http.OutgoingMessage,
  _rule: Rule,
  _requestData: any
) {
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader(
    'Access-Control-Allow-Origin',
    request.headers['origin'] || ''
  );
  response.setHeader('Content-Type', 'application/json');
  return NEXT;
}

function handleRequestDataMatch(
  request: http.IncomingMessage & Request,
  _response: http.OutgoingMessage,
  rule: Rule,
  requestData: any
) {
  const isFileMatch = isContain(requestData, rule?.request?.body, requestData);
  if (isFileMatch) {
    request.passThrough();
    return NEXT;
  }
}

function handleDefault(
  _request: http.IncomingMessage & Request,
  response: http.OutgoingMessage,
  rule: Rule,
  requestData: any
) {
  const body = generate(rule?.response?.body, requestData);
  response.end(JSON.stringify(body), 'utf-8');
}

function queue(items: Function[], params: unknown[]) {
  let isBreak = false;
  items.forEach(func => {
    if (!isBreak) {
      isBreak = func(...params) === NEXT ? false : true;
    }
  });
}
