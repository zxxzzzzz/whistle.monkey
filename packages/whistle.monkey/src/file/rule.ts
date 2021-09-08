import { Rule } from '@/interface/rule';
import micromatch from 'micromatch';

const store = new Map<string, Rule>()

export function addRule(key: string, rule: Rule) {
  if (!rule) {
    throw Error('rule不能为空')
  }
  if (!rule?.request?.url) {
    throw Error('request的url不能为空')
  }
  store.set(key, rule)
}
export function updateRule(key: string, rule: Rule) {
  if (!rule) {
    throw Error('rule不能为空')
  }
  const tempRule = store.get(key);
  if (tempRule) {
    store.set(key, { ...tempRule, ...rule })
    return
  }
  store.set(key, rule)
}
export function deleteRule(key: string) {
  store.delete(key)
}
export function disableRule(key: string) {
  const tempRule = store.get(key);
  if (tempRule) {
    tempRule.disabled = true
  }
}
export function enableRule(key: string) {
  const tempRule = store.get(key);
  if (tempRule) {
    tempRule.disabled = false
  }
}
export function getRule(key: string) {
  return store.get(key)
}

export function getRuleByUrl(url: string) {
  const urlObj = new URL(url);
  const pathNames = urlObj.pathname;
  return [...store.values()].find(rule => {
    return pathNames.includes(rule.request.url)
  })
}

export function query(queryList: string[]) {
  return micromatch([...store.keys()], queryList)
}

