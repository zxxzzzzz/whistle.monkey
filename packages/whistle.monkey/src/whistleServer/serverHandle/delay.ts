import { generate } from '@zhangxin/mock-monkey-core';
import { Rule } from '@/interface/rule';
import http from 'http';
import { Request } from '@/interface/request';

// 延迟功能
export function handleDelay(
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
        tags: ['命中'],
      });
    }, rule.delay);
    return;
  }
  return 'next';
}