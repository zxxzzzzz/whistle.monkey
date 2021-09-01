import { getValueByStatement } from '@zhangxin/mock-monkey-core';

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
    throw Error('请求参数不存在，但是却配置了请求参数验证, 所以请求失败');
  }
  Object.keys(child as { [key: string]: any }).forEach(key => {
    const cv = (child as { [key: string]: any })[key];
    const fv = (father as { [key: string]: any })[key];
    const bo = isEqual(cv, fv, scope);
    if (bo === false) {
      throw Error(`${key} 参数${cv}不匹配${fv}`);
    }
  });
  return true
}
