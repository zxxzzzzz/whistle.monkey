import {Obj} from 'generate/interface';

const scope = new Map<string,any>()
export function addValue(key:string,value:any){
  scope.set(key,value)
}
export function deleteValue(key:string){
  scope.delete(key)
}
export function clearScope(){
  scope.clear()
}
export function addScope(tScope:Obj<any> ={}){
  Object.keys(tScope).forEach(key => scope.set(key,tScope[key]))
}

export function deleteScope(tScope:Obj<any> ={}){
  Object.keys(tScope).forEach(key => scope.delete(key))
}

export function getScopeValue(key:string){
  return scope.get(key)
}
export function getScope(){
  return [...scope.keys()].reduce((re, key) =>({
    ...re,
    [key]:scope.get(key)
  }),{})
}