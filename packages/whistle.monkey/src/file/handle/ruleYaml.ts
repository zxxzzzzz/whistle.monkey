import path from 'path';
import { addRule, deleteRule, query, disableRule, updateRule } from '../rule';
import micromatch from 'micromatch';
import { Rule, SharedStore } from '@/interface/rule';
import { getIgnoreRules } from '@/utils/ignore';


export async function handleYAMLFile(store: SharedStore) {
  const { _path, eventName, root } = store
  const parsedPath = path.parse(_path);
  if (parsedPath.ext !== '.yaml') return 'next';
  if (eventName === 'add') {
    try {
      addRule(_path, { ...store.rule as Rule, filePath: _path, disabled: false })
      const ignoreRules = getIgnoreRules(parsedPath.dir, root);
      if (micromatch.isMatch(_path, ignoreRules)) {
        disableRule(_path);
        global.sendLog({ message: `禁用了模板<span class="text-pink-500">${_path}</span>`, type: 'warning', tags: ['禁用'] });
        return;
      }
      global.sendLog({ message: `添加了模板<span class="text-pink-500">${_path}</span>`, type: 'success', tags: ['添加'] });
    } catch (error) {
      global.sendLog({ message: `添加模板<span class="text-pink-500">${_path}</span>失败,${error.message}`, type: 'error' });
    }
  }
  if (eventName === 'change') {
    try {
      updateRule(_path, store.rule as Rule);
      global.sendLog({ message: `更新了模板<span class="text-pink-500">${_path}</span>`, type: 'success', tags: ['更新'] });
    } catch (error) {
      global.sendLog({ message: `更新模板<span class="text-pink-500">${_path}</span>失败`, type: 'error' });
    }
  }
  if (eventName === 'unlinkDir') {
    query([`${_path}/*`]).forEach(filePath => {
      deleteRule(filePath);
      global.sendLog({ message: `删除了模板<span class="text-pink-500">${_path}</span>`, type: 'warning', tags: ['禁用'] });
    });
  }
  if (eventName === 'unlink') {
    deleteRule(_path);
    global.sendLog({ message: `删除了模板<span class="text-pink-500">${_path}</span>`, type: 'success', tags: ['删除'] });
  }
  return;
}