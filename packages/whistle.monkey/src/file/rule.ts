import { Rule } from './interface';
const store = new Map<string, Rule>()

export function addRule(key:string, rule: Rule) {
  if(!rule){
    throw Error('rule不能为空')
  }
  store.set(key, rule)
}
export function updateRule(key:string, rule: Rule) {
  if(!rule){
    throw Error('rule不能为空')
  }
  store.set(key, rule)
}
export function deleteRule(key:string) {
  store.delete(key)
}
export function getRule(key:string) {
  return store.get(key)
}
export function deleteQuery(queryKey:string){
  query(queryKey).forEach((key) => {
    store.delete(key)
  })
}

export function getRuleByUrl(url:string) {
  const urlObj = new URL(url);
  const pathNames = urlObj.pathname;
  return [...store.values()].find(rule => {
    return pathNames.includes(rule.request.url)
  })
}

function query(queryKey:string) {
  return [...store.keys()].filter((key) => {
    return key.includes(queryKey)
  })
}

