import chokidar from 'chokidar';
import fs from 'fs';
import YAML from 'yaml';
import path from 'path';
import { addRule, deleteRule, deleteQuery } from './rule';
export { getRuleByUrl, getRule } from './rule'
import { addFunction } from '@zhangxin/mock-monkey-core';
import findup from 'findup-sync';
import micromatch from 'micromatch'

let currentWatcher: chokidar.FSWatcher
export async function watch(watchPath: string) {
  if (currentWatcher) {
    await currentWatcher.close()
  }
  if (!fs.existsSync(watchPath)) throw Error('path not exist')
  currentWatcher = chokidar.watch(watchPath).on('all', (eventName, _path) => {
    const parsedPath = path.parse(_path)
    const ignoreFilePath = getIgonre(parsedPath.dir)
    let ignoreRules = [] as string[]
    if(ignoreFilePath){
      ignoreRules = fs.readFileSync(ignoreFilePath,{encoding:'utf-8'}).split('\n').map(text => text.replace(/[\s]*/g, ''))
    }
    if(micromatch.isMatch(_path, ignoreRules,{basename:true})){
      global.sendLog({ message: `忽略了<span class="text-pink-500">${_path}</span>`, date: new Date().valueOf(), type: 'warning', tags: ['忽略'] })
      return
    }
    if(parsedPath.ext === '.js' && ['add', 'change'].includes(eventName)){
        const i18n = {
          add:'添加',
          change:'更新',
          unlinkDir:'',
          unlink: '',
          addDir: ''
        }
        try {
          if(eventName === 'change') delete require.cache[_path]
          const mod = require(_path)
          Object.keys(mod).forEach((key) => {
            addFunction(key, mod[key])
          })
          global.sendLog({ message: `${i18n[eventName]}了函数<span class="text-pink-500">${_path}</span>`, date: new Date().valueOf(), type: 'success', tags: ['添加', '函数'] })
          return
        } catch (error) {
          global.sendLog({ message: `${i18n[eventName]}函数<span class="text-pink-500">${_path}</span>失败，${error.message}`, date: new Date().valueOf(), type: 'success', tags: ['添加', '函数'] })
          return
        }
    }
    if (parsedPath.ext !== '.yaml') return
    if (eventName === 'add') {
      try {
        addFile(_path);
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
      deleteQuery(_path);
    }
    if (eventName === 'unlink') {
      deleteFile(_path);
      global.sendLog({ date: new Date().valueOf(), message: `删除了模板<span class="text-pink-500">${_path}</span>`, type: 'success', tags: ['删除'] })
    }
  });
}

function getObjFromYAML(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return { ...YAML.parse(content), filePath };
  } catch (error) {
    return null;
  }
}

function addFile(filePath: string) {
  addRule(filePath, getObjFromYAML(filePath));
}
function updateFile(filePath: string) {
  addRule(filePath, getObjFromYAML(filePath));
}
function deleteFile(filePath: string) {
  deleteRule(filePath);
}

function getIgonre(dir:string){
  return findup('.ignore', {cwd:dir})
}