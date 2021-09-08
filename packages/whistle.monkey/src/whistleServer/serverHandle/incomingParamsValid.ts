import { Rule } from '@/interface/rule';
import http from 'http';
import { isValid } from '@/utils/match';
import { Request } from '@/interface/request';

// 对入参的验证。
export function handleRequestDataMatch(
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
      tags: ['命中','入参'],
    });
    return;
  }
  return 'next';
}