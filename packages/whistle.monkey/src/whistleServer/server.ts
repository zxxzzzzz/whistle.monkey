import { getRule } from '../file/index';
import { generate } from '@zhangxin/mock-monkey-core';
import { Rule } from '../file/interface';
import http from 'http';
import { isValid } from '../utils/match';

interface Request {
  originalReq: {
    ruleValue: string;
  };
  passThrough: () => {};
}

const NEXT = 'next';

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
              [handleCors, handleRequestDataMatch, handleDelay, handleDefault],
              [req, res, rule, requestData]
            );
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

// 延迟功能
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

// 跨域设置
function handleCors(
  request: http.IncomingMessage & Request,
  response: http.OutgoingMessage
) {
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader(
    'Access-Control-Allow-Origin',
    request.headers['origin'] || ''
  );
  response.setHeader('Content-Type', 'application/json');
  return NEXT;
}

// 对入参的验证。
function handleRequestDataMatch(
  request: http.IncomingMessage & Request,
  response: http.ServerResponse,
  rule: Rule,
  requestData: any
) {
  try {
    isValid(requestData, rule?.request?.body, requestData);
  } catch (error) {
    response.statusCode = 400;
    response.statusMessage = error.message;
    response.end(
      JSON.stringify({ code: 400, message: error.message }),
      'utf-8'
    );
    const filePath = decodeURIComponent(request.originalReq.ruleValue);
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    global.sendLog({
      type: 'error',
      message: `请求<span class="text-purple-500">${url.pathname}</span>命中文件<span class="text-pink-500">${filePath}</span>,但是参数有问题`,
      date: new Date().valueOf(),
      tags: ['命中','入参'],
    });
    return;
  }
  return NEXT;
}
// 兜底方案
function handleDefault(
  request: http.IncomingMessage & Request,
  response: http.OutgoingMessage,
  rule: Rule,
  requestData: any
) {
  const filePath = decodeURIComponent(request.originalReq.ruleValue);
  const body = generate(rule?.response?.body, requestData);
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  response.end(JSON.stringify(body), 'utf-8');
  global.sendLog({
    type: 'success',
    message: `请求<span class="text-purple-500">${url.pathname}</span>命中文件<span class="text-pink-500">${filePath}</span>`,
    date: new Date().valueOf(),
    tags: ['命中'],
  });
}

function queue(items: Function[], params: unknown[]) {
  let isBreak = false;
  items.forEach(func => {
    if (!isBreak) {
      isBreak = func(...params) === NEXT ? false : true;
    }
  });
}
