import { Obj } from '@/generate/interface';
import R from 'ramda';
import {getReserveFunc} from '../reserve';
import {getScope} from '../scope';

function getValueByStatement({scope,reserveFunctions,statement}:{scope:Obj<any>,reserveFunctions:Obj<any>,statement:string}){
  const combine = {...scope,...reserveFunctions}
  try {
    const func = Function(...Object.keys(combine),`return ${statement}`)
    return func(...R.values(combine))
  } catch (error) {
    return statement
  }
}

export function getValue(statement:string, scope?:Obj<any>){
  return getValueByStatement({scope:scope || getScope(),reserveFunctions:getReserveFunc(),statement})
}