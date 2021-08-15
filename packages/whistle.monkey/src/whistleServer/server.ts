import { getRule } from '../file/index';
import {generate, getValueByStatement} from '@zhangxin/mock-monkey-core';

function isMatch(statement:string, val:any,scope:any){
  const result = getValueByStatement(statement, scope)
  if(typeof result === 'function'){
    return result(val)
  }
  return val === result
}

export function isContain(father: any, child: any, scope:any):boolean {
  if(!child) return true
  if (father === child) return true;
  if(typeof child === 'string'){
    return isMatch(child, father, scope)
  }
  if (typeof father !== 'object' || typeof child !== 'object') return false;
  if(Array.isArray(father) && Array.isArray(child)) {
    child.every((i) => {
      if(typeof i !== 'object') return father.includes(i)
      return father.some((fj) => {
        isContain(fj, i, scope)
      })
    })
  }
  return Object.keys(child).every((childKey) =>{
    const childItem = child[childKey]
    const fatherItem = father[childKey]
    if(!fatherItem) return false
    return isContain(fatherItem, childItem, scope)
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
          const isFileMatch = isContain(requestData, rule?.request?.body, requestData);
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
          global.sendLog({
            type:'success',
            message:`请求<span class="text-purple-500">${url.pathname}</span>命中文件<span class="text-pink-500">${filePath}</span>`,
            date: new Date().valueOf(),
            tags:['命中']
          })
        } catch (error) {
          res.setHeader('Content-Type', 'text/plain');
          res.end(error.message, 'utf-8');
          console.log(error);
        }
      });
    }
  });
};
