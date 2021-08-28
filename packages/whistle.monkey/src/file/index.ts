import chokidar from 'chokidar';
import fs from 'fs';
import YAML from 'js-yaml';
import path from 'path';
import { addRule, deleteRule, getRule, query, disableRule, enableRule } from './rule';
export { getRuleByUrl, getRule } from './rule'
import { addFunction } from '@zhangxin/mock-monkey-core';
import findup from 'findup-sync';
import micromatch from 'micromatch';
import { Rule } from './interface';

let currentWatcher: chokidar.FSWatcher
export async function watch(watchPath: string) {
  if (currentWatcher) {
    await currentWatcher.close()
  }
  if (!fs.existsSync(watchPath)) throw Error('path not exist')
  currentWatcher = chokidar.watch(watchPath).on('all', (eventName, _path) => {
    queue(
      [handleJSFile, handleYAMLFile, handleIgnore],
      [eventName, _path.replace(/[\\]/g, '/'), watchPath.replace(/[\\]/g, '/')]
    )
  });
}

function getObjFromYAML(filePath: string) {
  let parsedJSON = {request:{url:'',body:{}},response:{body:{}}} as Partial<Rule>
  try {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const parsedYaml = YAML.load(content) as Partial<Rule>
    if (!parsedYaml) throw Error('文件内容不能为空')
    // 把合法的json转换为合法yaml
    if(!parsedYaml.request){
      parsedJSON = formatJsonToYAML(content)
      fs.writeFileSync(filePath, YAML.dump({...parsedJSON }), { encoding: 'utf-8' })
      return parsedJSON
    }
    return parsedYaml
  } catch (error) {
    fs.writeFileSync(filePath, YAML.dump(parsedJSON), { encoding: 'utf-8' })
    return {};
  }
}
// 把json转换为yaml。不catch错误。
function formatJsonToYAML(content: string) {
  const contentWithoutDocs = content.replace(/\/\/[\s\S]*/g, '')
  const parsed = JSON.parse(contentWithoutDocs)
  // 有符合定义的结构体，就不覆盖用户之前输入了
  if (parsed?.request) {
    return {}
  }
  // 没有符合定义的结构体，说明试复制来的后端json对象
  return {
    request: { url: '',body:{} },
    response: {
      body: parsed
    }
  }
}

function addFile(filePath: string) {
  addRule(filePath, { ...getObjFromYAML(filePath), filePath, disabled: false } as Rule);
}
function updateFile(filePath: string) {
  addRule(filePath, getObjFromYAML(filePath) as Rule);
}
function deleteFile(filePath: string) {
  deleteRule(filePath);
}



async function queue(funcs: Function[], params: any[]) {
  for (const func of funcs) {
    await func(...params)
  }
}

function getIgnoreRules(dir: string, root: string) {
  const ignoreFilePath = findup('.ignore', { cwd: dir })
  let ignoreRules = [] as string[]
  if (ignoreFilePath) {
    ignoreRules = fs.readFileSync(ignoreFilePath, { encoding: 'utf-8' })
      .split('\n')
      .filter(text => !text.startsWith('// '))
      .map(text => {
        const prefixPath = `${path.parse(ignoreFilePath.replace(/[\\]/g, '/')).dir}`.replace(root, '**')
        return `${prefixPath}/${text.replace(/[\s]*/g, '')}`
      })
  }
  return ignoreRules
}

async function handleJSFile(eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', _path: string) {
  const parsedPath = path.parse(_path)
  if (parsedPath.ext === '.js' && ['add', 'change'].includes(eventName)) {
    const i18n = {
      add: '添加',
      change: '更新',
      unlinkDir: '',
      unlink: '',
      addDir: ''
    }
    try {
      if (eventName === 'change') delete require.cache[_path]
      const mod = require(_path)
      Object.keys(mod).forEach((key) => {
        addFunction(key, mod[key])
      })
      global.sendLog({ message: `${i18n[eventName]}了函数<span class="text-pink-500">${_path}</span>`, date: new Date().valueOf(), type: 'success', tags: ['添加', '函数'] })
    } catch (error) {
      global.sendLog({ message: `${i18n[eventName]}函数<span class="text-pink-500">${_path}</span>失败，${error.message}`, date: new Date().valueOf(), type: 'success', tags: ['添加', '函数'] })
    }
  }
}

async function handleYAMLFile(eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', _path: string, root: string) {
  const parsedPath = path.parse(_path)
  if (parsedPath.ext !== '.yaml') return
  if (eventName === 'add') {
    try {
      addFile(_path);
      const ignoreRules = getIgnoreRules(parsedPath.dir, root)
      if (micromatch.isMatch(_path, ignoreRules)) {
        disableRule(_path)
        global.sendLog({ message: `禁用了模板<span class="text-pink-500">${_path}</span>`, date: new Date().valueOf(), type: 'warning', tags: ['禁用'] })
        return
      }
      global.sendLog({ message: `添加了模板<span class="text-pink-500">${_path}</span>`, date: new Date().valueOf(), type: 'success', tags: ['添加'] })
    } catch (error) {
      global.sendLog({ message: `添加模板<span class="text-pink-500">${_path}</span>失败,${error.message}`, date: new Date().valueOf(), type: 'error' })
    }
  }
  if (eventName === 'change') {
    try {
      updateFile(_path);
      global.sendLog({ date: new Date().valueOf(), message: `更新了模板<span class="text-pink-500">${_path}</span>`, type: 'success', tags: ['更新'] })
    } catch (error) {
      global.sendLog({ message: `更新模板<span class="text-pink-500">${_path}</span>失败`, date: new Date().valueOf(), type: 'error' })
    }
  }
  if (eventName === 'unlinkDir') {
    query([`${_path}/*`]).forEach((filePath) => {
      deleteRule(filePath)
      global.sendLog({ message: `禁用了模板<span class="text-pink-500">${_path}</span>`, date: new Date().valueOf(), type: 'warning', tags: ['禁用'] })
    })
  }
  if (eventName === 'unlink') {
    deleteFile(_path);
    global.sendLog({ date: new Date().valueOf(), message: `删除了模板<span class="text-pink-500">${_path}</span>`, type: 'success', tags: ['删除'] })
  }
}

async function handleIgnore(_eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', _path: string, root: string) {
  const parsedPath = path.parse(_path)
  if (parsedPath.name === '.ignore') {
    const ignoreRules = getIgnoreRules(parsedPath.dir, root)
    query(['**']).forEach((filePath) => {
      const rule = getRule(filePath)
      if (rule?.disabled === true && !micromatch.isMatch(filePath, ignoreRules)) {
        enableRule(filePath)
        global.sendLog({ message: `启用了模板<span class="text-pink-500">${filePath}</span>`, date: new Date().valueOf(), type: 'success', tags: ['启用'] })
        return
      }
      if (rule?.disabled === false && micromatch.isMatch(filePath, ignoreRules)) {
        disableRule(filePath)
        global.sendLog({ message: `禁用了模板<span class="text-pink-500">${filePath}</span>`, date: new Date().valueOf(), type: 'warning', tags: ['禁用'] })
      }
    })
  }
}