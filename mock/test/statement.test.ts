import {getValue} from '../src/generate/statement';
import {addValue,addScope} from '../src/scope';

describe('表达式计算', () => {
  it('statement', () => {
    addValue('pageSize', 1)
    addScope({test:2})
    expect(getValue('pageSize+R.min(1,2)+test')).toEqual(4);
    expect(typeof getValue('fake`{{name.lastName}}`')).toEqual('string')
    expect(typeof getValue('fk.name.lastName()')).toEqual('string')
    expect(getValue('random(10,10)')).toEqual(10)
    expect(getValue('2')).toEqual(2)
    expect(getValue('2')).toEqual(2)
  });
});
