import path from 'path';
import YAML from 'js-yaml';
import fs from 'fs';
import { Rule, SharedStore } from '../interface';

// 把json转换为yaml。不catch错误。
function getValidJson(content: string, defaultRule:Partial<Rule>) {
  const contentWithoutDocs = content.replace(/\/\/[^\n\r]*/g, '');
  const parsed = JSON.parse(contentWithoutDocs);
  // 有符合定义的结构体，就不覆盖用户之前输入了
  if (parsed?.request) {
    return parsed;
  }
  // 没有符合定义的结构体，说明试复制来的后端json对象
  return {
    ...defaultRule,
    response: {
      body: parsed,
    },
  };
}

// 处理非法的yaml格式
export async function handleInvalidYaml(store: SharedStore) {
  const { _path, eventName } = store
  const parsedPath = path.parse(_path);
  if (!['add', 'change'].includes(eventName)) return 'next';
  if (parsedPath.ext !== '.yaml') return 'next';
  let parsedJSON = { request: { url: path.parse(_path).name, body: {} }, response: { body: {} } } as Partial<Rule>;
  const content = fs.readFileSync(_path, { encoding: 'utf-8' });
  // 文件内容为空，初始化一个模板
  if (content === '') {
    fs.writeFileSync(_path, YAML.dump({ ...parsedJSON }), {encoding: 'utf-8'});
    return
  }
  try {
    // 如果输入的是合法json,把他变成yaml格式
    const obj = getValidJson(content, parsedJSON);
    fs.writeFileSync(_path, YAML.dump(obj), { encoding: 'utf-8' });
    return 
  } catch (error) { 
   
  }
  try {
    store.rule = YAML.load(content) as Rule;
    return 'next';
  } catch (error) {
    // 如果yaml格式化失败，发送问题到log
    global.sendLog({
      message: `${_path}文件有格式问题<span class="text-pink-500">${error.message}</span>`,
      type: 'error',
      tags: ['yaml', '格式'],
    });
  }
  return;
}