import {generate} from '../src/generate';

describe('对象生成', () => {
  it('generate', () => {
    expect(generate({a:1,'b<2>':1})).toEqual({a:1,b:[1,1]})
    expect(generate({a:1,'test':'hello'},{hello:'world'})).toEqual({a:1,test:'world'})
    expect(generate({a:1,'b<2>':'index'})).toEqual({a:1,b:[0,1]})
    expect(generate({a:1,b:{'a<2>':1}})).toEqual({a:1,b:{a:[1,1]}})
    expect(generate({a:1,b:[1+1,2+2,3]})).toEqual({a:1,b:[2,4,3]})
    expect(generate({a:1,b:['R.min(2,3)',2+2,3]})).toEqual({a:1,b:[2,4,3]})
    expect(generate({a:1,'b<2>': {q:1, w:'q+1',e:'w+1'}})).toEqual({ a: 1, b: [ { q: 1, w: 2, e: 3 }, { q: 1, w: 2, e: 3 } ] })
    expect(generate({a:1,'b<false>': {q:1, w:'q+1',e:'w+1'}})).toEqual({ a: 1 })
    expect(generate({a:1,'b<true>': {q:1, w:'q+1',e:'w+1'}})).toEqual({ a: 1,b:{ q: 1, w: 2, e: 3 } })
    expect(generate({a:'(1+2)*3', b:['R.min(2,3)', 2+2, 3]})).toEqual({a:9,b:[2,4,3]})
  });
});
