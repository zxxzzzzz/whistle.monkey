import chokidar from 'chokidar';
import fs from 'fs';
import YAML from 'yaml';
import { addRule, deleteRule,deleteQuery } from './rule';

export function watch(watchPath: string) {
  chokidar.watch(watchPath).on('all', (eventName, path) => {
    console.log(eventName, path);
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
    return YAML.parse(content);
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