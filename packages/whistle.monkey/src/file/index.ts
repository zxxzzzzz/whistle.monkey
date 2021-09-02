import chokidar from 'chokidar';
import fs from 'fs';
export { getRuleByUrl, getRule } from '@/file/rule';
import { SharedStore } from '@/file/interface';
import { handleInvalidYaml } from '@/file/handle/invalidYaml';
import { handleJSFile } from '@/file/handle/jsFile';
import { handleYAMLFile } from '@/file/handle/ruleYaml';
import { handleIgnore } from '@/file/handle/ignore';


let currentWatcher: chokidar.FSWatcher;
export async function watch(watchPath: string) {
  if (currentWatcher) {
    await currentWatcher.close();
  }
  if (!fs.existsSync(watchPath)) throw Error('path not exist');
  currentWatcher = chokidar.watch(watchPath).on('all', (eventName, _path) => {
    queue([handleInvalidYaml, handleJSFile, handleYAMLFile, handleIgnore], {
      eventName,
      _path: _path.replace(/[\\]/g, '/'),
      root: watchPath.replace(/[\\]/g, '/'),
      content: ''
    });
  });
}

async function queue(
  funcs: ((store: SharedStore) => any)[],
  params: SharedStore
) {
  if (!funcs.length) return;
  const store: SharedStore = params;
  for (const func of funcs) {
    const flag = await func(store);
    if (flag !== 'next') {
      break;
    }
  }
}
