import { getRule } from './file/index';
import {generate} from 'mock-monkey-core';

export function isContain(father: any, child: any):boolean {
  if(!child) return true
  if (father === child) return true;
  if (typeof father !== 'object' || typeof child !== 'object') return false;
  if(Array.isArray(father) && Array.isArray(child)) {
    child.every((i) => {
      if(typeof i !== 'object') return father.includes(i)
      return father.some((fj) => {
        isContain(fj, i)
      })
    })
  }
  return Object.keys(child).every((childKey) =>{
    const childItem = child[childKey]
    const fatherItem = father[childKey]
    if(!fatherItem) return false
    return isContain(fatherItem, childItem)
  })
}

export default (server: any) => {
  server.on('request', (req: any, res: any) => {
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
          const url = new URL(req.url, `http://${req.headers.host}`);
          const queryData: { [key: string]: any } = {};
          url.searchParams.forEach((val, key) => {
            queryData[key] = val;
          });
          const requestData = { ...JSON.parse(data), ...queryData };
          // console.log(requestData.filterList, file.match.data.filterList);
          const isFileMatch = isContain(requestData, rule?.request?.body);
          if (!isFileMatch) {
            req.passThrough();
            return;
          }
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Origin', req.headers['origin']);
          res.setHeader('Content-Type', 'application/json');
          const body = generate(rule?.response?.body, requestData);
          // if (typeof template.delay === 'number') {
          //   setTimeout(() => {
          //     res.end(JSON.stringify(body), 'utf-8');
          //   }, template.delay);
          //   return;
          // }
          res.end(JSON.stringify(body), 'utf-8');
        } catch (error) {
          res.setHeader('Content-Type', 'text/plain');
          res.end(error.message, 'utf-8');
          console.log(error);
        }
      });
    }
  });
};
