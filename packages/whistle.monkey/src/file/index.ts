import chokidar from 'chokidar';
import fs from 'fs';
import YAML from 'yaml';
import { addRule, deleteRule, deleteQuery } from './rule';
export { getRuleByUrl, getRule } from './rule'

let currentWatcher:chokidar.FSWatcher
export async function watch(watchPath: string) {
  if(currentWatcher){
    await currentWatcher.close()
  }
  currentWatcher = chokidar.watch(watchPath).on('all', (eventName, path) => {
    if (eventName === 'add') {
      addFile(path);
    }
    if (eventName === 'change') {
      updateFile(path);
    }
    if (eventName === 'unlinkDir') {
      deleteQuery(path);
    }
    if (eventName === 'unlink') {
      deleteFile(path);
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