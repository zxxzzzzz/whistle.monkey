import { addFunction } from '@zhangxin/mock-monkey-core';
import path from 'path';
export { getRuleByUrl, getRule } from '../rule';
import { SharedStore } from '../interface';

export async function handleJSFile(store:SharedStore) {
  const { _path, eventName } = store
  const parsedPath = path.parse(_path);
  if (parsedPath.ext !== '.js' || !['add', 'change'].includes(eventName)) return 'next';
  const i18n = {
    add: '添加',
    change: '更新',
    unlinkDir: '',
    unlink: '',
    addDir: '',
  };
  try {
    if (eventName === 'change') delete require.cache[_path];
    const mod = require(_path);
    Object.keys(mod).forEach(key => {
      addFunction(key, mod[key]);
    });
    global.sendLog({
      message: `${i18n[eventName]}了函数<span class="text-pink-500">${_path}</span>`,
      type: 'success',
      tags: ['添加', '函数'],
    });
  } catch (error) {
    global.sendLog({
      message: `${i18n[eventName]}函数<span class="text-pink-500">${_path}</span>失败，${error.message}`,
      type: 'success',
      tags: ['添加', '函数'],
    });
  }
  return;
}