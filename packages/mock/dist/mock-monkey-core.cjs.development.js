'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var R = _interopDefault(require('ramda'));
var _ = _interopDefault(require('lodash'));
var dayjs = _interopDefault(require('dayjs'));
var faker = _interopDefault(require('faker'));
var isBetween = _interopDefault(require('dayjs/plugin/isBetween'));
var validator = _interopDefault(require('validator'));

function isDateString(str = '') {
  if (typeof str !== 'string') {
    return false;
  }

  const [year, month, day] = str.split('-');

  if (Number.isNaN(_.toNumber(year))) {
    return false;
  }

  if (Number.isNaN(_.toNumber(month))) {
    return false;
  }

  if (Number.isNaN(_.toNumber(day))) {
    return false;
  }

  if (_.toNumber(month) > 12 || _.toNumber(month) < 1) {
    return false;
  }

  if (_.toNumber(day) > 31 || _.toNumber(day) < 1) {
    return false;
  }

  return true;
}

dayjs.extend(isBetween);
const additionalFunction = /*#__PURE__*/new Map();
function addFunction(key, value) {
  additionalFunction.set(key, value);
}
addFunction('random', _.random);
addFunction('fake', strings => {
  return faker.fake(strings[0]);
});
addFunction('test', val => {
  throw Error('测试 报错' + val);
});
addFunction('between', (...params) => {
  const [p1, p2] = params;

  if (isDateString(p1) && isDateString(p2)) {
    return value => {
      return dayjs(value).isBetween(p1, p2);
    };
  }

  if (typeof p1 === 'number' && typeof p2 === 'number') {
    return value => {
      return value > p1 && value <= p2;
    };
  }

  return () => false;
});
function getReserveFunc() {
  const addObj = [...additionalFunction.entries()].reduce((re, entry) => {
    re[entry[0]] = entry[1];
    return re;
  }, {});
  return {
    R,
    _,
    dayjs,
    faker,
    v: validator,
    ...addObj
  };
}

const scope = /*#__PURE__*/new Map();
function addValue(key, value) {
  scope.set(key, value);
}
function addScope(tScope = {}) {
  Object.keys(tScope).forEach(key => scope.set(key, tScope[key]));
}
function deleteScope(tScope = {}) {
  Object.keys(tScope).forEach(key => scope.delete(key));
}
function getScope() {
  return [...scope.keys()].reduce((re, key) => ({ ...re,
    [key]: scope.get(key)
  }), {});
}

function getValueByStatement({
  scope,
  reserveFunctions,
  statement
}) {
  const combine = { ...scope,
    ...reserveFunctions
  };

  try {
    const func = Function(...Object.keys(combine), `return ${statement}`);
    return func(...R.values(combine));
  } catch (error) {
    return statement;
  }
}

function getValue(statement, scope) {
  return getValueByStatement({
    scope: scope || getScope(),
    reserveFunctions: getReserveFunc(),
    statement
  });
}

function getPureKey(key = '') {
  return key.replace(/<([\s\S]*)>/g, '');
} // 获取asd<@random(1,3)>  这种数据定义的数组长度


function getKeyOption(key = '') {
  if (/[a-zA-Z0-9]+[<][\s\S]*[>]/.test(key)) {
    const statement = key.slice(key.indexOf('<') + 1, -1);
    const value = getValue(statement);

    if (value === false) {
      return {
        length: 0,
        exist: value === false ? false : true
      };
    }

    const tValue = parseInt(value, 10);

    if (Number.isNaN(tValue)) {
      return {
        length: 0,
        exist: true
      };
    } else {
      return {
        length: tValue,
        exist: true
      };
    }
  }

  return {
    length: 0,
    exist: true
  };
} // a:[1,2,3] 这种情况的处理


function generateArray(list) {
  return list.map(elem => {
    if (Array.isArray(elem)) {
      return generateArray(elem);
    }

    if (elem.constructor === Object) {
      return generateObject(elem);
    } // 处理原始类型


    return getValue(elem);
  });
} // 根据配置生成mock的数据


function generateObject(result) {
  const keys = Object.keys(result);
  return keys.reduce((re, key) => {
    const value = result[key]; // tKey是去除参数的可读key   list<@number>  =>  list

    const objectValue = generateByKey({
      key,
      value
    });
    const tKey = getPureKey(key); // 如果生成的值是undefined,直接忽略这个字段

    if (objectValue === undefined) {
      return re;
    } // 相同的key要合并成数组


    if (!re[tKey]) {
      re[tKey] = objectValue;
    } else {
      re[tKey] = [...[].concat(re[tKey], ...[].concat(objectValue))];
    }

    return re;
  }, {});
} // a<10>:xxx  这种情况的处理
// value可能是个variable也可能是个map
// 通过key的配置生成单独的obj


function generateByKey({
  key,
  value
}) {
  const option = getKeyOption(key);
  const tKey = getPureKey(key); // 该字段不需要

  if (!option.exist) {
    return undefined;
  } // 不是数组，即普通对象


  if (option.length === 0) {
    if (value == null) {
      return value;
    }

    if (value.constructor === Object) {
      return generateObject(value);
    }

    if (Array.isArray(value)) {
      return generateArray(value);
    }

    const tValue = getValue(value);
    addValue(tKey, tValue);
    return tValue;
  } // 是数组


  return R.range(0, option.length).map(index => {
    addValue('index', index);

    if (value == null) {
      return value;
    }

    if (value.constructor === Object) {
      return generateObject(value);
    }

    if (Array.isArray(value)) {
      return generateArray(value);
    }

    const tValue = getValue(value);
    addValue(tKey, tValue);
    return tValue;
  });
}

function generate(body, scope = {}) {
  if (body) {
    addScope(scope);
    const re = generateObject(body);
    deleteScope(scope);
    return re;
  }

  return undefined;
}

exports.addFunction = addFunction;
exports.generate = generate;
exports.getValueByStatement = getValue;
//# sourceMappingURL=mock-monkey-core.cjs.development.js.map
