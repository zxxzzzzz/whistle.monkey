import R from 'ramda';
import _ from 'lodash';
import {isDateString} from '../utils/is';
import dayjs from 'dayjs';
import faker from 'faker';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const additionalFunction = new Map<string, Function>()
export function addFunction(key:string,value:Function){
  additionalFunction.set(key, value)
}

export function deleteFunction(){
  
}

addFunction('random', _.random)

addFunction('fake', (strings:string[])=>{
  return faker.fake(strings[0])
})
addFunction('test', (val:string)=>{
  throw Error('测试 报错' + val)
})

addFunction('between',(...params:any[]) => {
  const [p1,p2] = params
  if(isDateString(p1) && isDateString(p2)){
    return (value:string)=>{
      return dayjs(value).isBetween(p1,p2)
    }
  }
  if(typeof p1 === 'number' && typeof p2 === 'number'){
    return (value:number|string) => {
      return value > p1 && value <= p2
    }
  }
  return ()=>false
})

export function getReserveFunc(){
  const addObj = [...additionalFunction.entries()].reduce((re, entry) => {
    re[entry[0]] = entry[1]
    return re
  }, {} as {[key:string]:any})
  return {R, _, dayjs, faker, ...addObj}
}