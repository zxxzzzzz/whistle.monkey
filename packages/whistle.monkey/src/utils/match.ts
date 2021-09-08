import { getValueByStatement } from '@zhangxin/mock-monkey-core';

type cMap = { [key: string]: any }

function isEqual(statement: string, val: any, scope: any) {
  const result = getValueByStatement(statement, scope);
  if (typeof result === 'function') {
    result(val);
  }
  return val === result;
}

// 根据多数接口调查，request body一般就一层结构，所以做个简单的，只遍历第一层的
export function isValid(
  father: unknown,
  child: unknown,
  scope: unknown
): boolean {
  if (child == null) {
    return true;
  }
  if (father == null) {
    throw Error('入参不存在，但是却配置了入参验证, 所以请求失败');
  }
  Object.keys(child as cMap).forEach(key => {
    const cv = (child as cMap)[key];
    const fv = (father as cMap)[key];
    const bo = isEqual(cv, fv, scope);
    if (bo === false) {
      throw Error(`入参字段 ${key} 不符合判定规则`);
    }
  });
  return true
}
