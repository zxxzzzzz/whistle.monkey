import { Obj, Body } from 'generate/interface';
import { getValue } from './statement';
import { addScope, addValue, deleteScope } from '../scope';
import R from 'ramda';

// a<2>  => a
function getPureKey(key = '') {
  return key.replace(/<([\s\S]*)>/g, '')
}

// 获取asd<@random(1,3)>  这种数据定义的数组长度
function getKeyOption(key = '') {
  if (/[a-zA-Z0-9]+[<][\s\S]*[>]/.test(key)) {
    const statement = key.slice(key.indexOf('<') + 1, -1)
    const value = getValue(statement);
    if (value === false) {
      return { length: 0, exist: value === false ? false : true };
    }
    const tValue = parseInt(value, 10)
    if (Number.isNaN(tValue)) {
      return { length: 0, exist: true }
    } else {
      return { length: tValue, exist: true };
    }
  }
  return { length: 0, exist: true }
}

// a:[1,2,3] 这种情况的处理
function generateArray(list: Array<any>): any {
  return list.map((elem) => {
    if (Array.isArray(elem)) {
      return generateArray(elem);
    }
    if (elem.constructor === Object) {
      return generateObject(elem);
    }
    // 处理原始类型
    return getValue(elem);
  });
}

// 根据配置生成mock的数据
function generateObject(result: Obj<any>) {
  const keys = Object.keys(result);
  return keys.reduce((re, key) => {
    const value = result[key];
    // tKey是去除参数的可读key   list<@number>  =>  list
    const objectValue = generateByKey({ key, value });
    const tKey = getPureKey(key);
    // 如果生成的值是undefined,直接忽略这个字段
    if (objectValue === undefined) {
      return re
    }
    // 相同的key要合并成数组
    if (!re[tKey]) {
      re[tKey] = objectValue;
    } else {
      re[tKey] = [...[].concat(re[tKey], ...[].concat(objectValue))];
    }
    return re;
  }, {} as Obj<any>);
}

// a<10>:xxx  这种情况的处理
// value可能是个variable也可能是个map
// 通过key的配置生成单独的obj
function generateByKey({ key, value }: { key: string, value: any }) {
  const option = getKeyOption(key);
  const tKey = getPureKey(key)
  // 该字段不需要
  if (!option.exist) {
    return undefined
  }
  // 不是数组，即普通对象
  if (option.length === 0) {
    if (value == null) {
      return value
    }
    if (value.constructor === Object) {
      return generateObject(value);
    }
    if (Array.isArray(value)) {
      return generateArray(value);
    }
    const tValue = getValue(value)
    addValue(tKey, tValue)
    return tValue;
  }
  // 是数组
  return R.range(0, option.length).map((index) => {
    addValue('index', index);
    if (value == null) {
      return value
    }
    if (value.constructor === Object) {
      return generateObject(value);
    }
    if (Array.isArray(value)) {
      return generateArray(value);
    }
    const tValue = getValue(value)
    addValue(tKey, tValue)
    return tValue;
  });
}



export function generate(body: Body, scope: Obj<any> = {}) {
  if (body) {
    addScope(scope)
    const re = generateObject(body)
    deleteScope(scope)
    return re
  }
  return undefined
}



