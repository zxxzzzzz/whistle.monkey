import { getRule } from '@/file/rule';
import http from 'http';
import { Request } from '@/interface/request';
import {handleCors} from '@/whistleServer/serverHandle/cors';
import {handleDefault} from '@/whistleServer/serverHandle/default';
import {handleDelay} from '@/whistleServer/serverHandle/delay';
import {handleRequestDataMatch} from '@/whistleServer/serverHandle/incomingParamsValid';


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

function queue(items: Function[], params: unknown[]) {
  let isBreak = false;
  items.forEach(func => {
    if (!isBreak) {
      isBreak = func(...params) === NEXT ? false : true;
    }
  });
}
