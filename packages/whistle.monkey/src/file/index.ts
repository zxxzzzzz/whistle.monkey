import chokidar from 'chokidar';
import fs from 'fs';
import YAML from 'yaml';
import path from 'path';
import { addRule, deleteRule, deleteQuery } from './rule';
export { getRuleByUrl, getRule } from './rule'

let currentWatcher:chokidar.FSWatcher
export async function watch(watchPath: string) {
  if(currentWatcher){
    await currentWatcher.close()
  }
  if(!fs.existsSync(watchPath)) throw Error('path not exist')
  currentWatcher = chokidar.watch(watchPath).on('all', (eventName, _path) => {
    const parsedPath = path.parse(_path)
    if(parsedPath.ext !== '.yaml') return
    if (eventName === 'add') {
      addFile(_path);
      global.sendLog({action:'add',message:`添加了模板 ${_path}`, name:'123',type:'success'})
    }
    if (eventName === 'change') {
      updateFile(_path);
      global.sendLog({action:'update',message:`更新了模板 ${_path}`, name:'123',type:'success'})
    }
    if (eventName === 'unlinkDir') {
      deleteQuery(_path);
    }
    if (eventName === 'unlink') {
      deleteFile(_path);
      global.sendLog({action:'delete',message:`删除了模板 ${_path}`, name:'123',type:'success'})
    }
  });
}

function getObjFromYAML(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return {...YAML.parse(content), filePath};
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