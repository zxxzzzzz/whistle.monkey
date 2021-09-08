import http from 'http';
import { Request } from '@/interface/request';

// 跨域设置
export function handleCors(
  request: http.IncomingMessage & Request,
  response: http.OutgoingMessage
) {
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader(
    'Access-Control-Allow-Origin',
    request.headers['origin'] || ''
  );
  response.setHeader('Content-Type', 'application/json');
  return 'next';
}