import fs from 'fs';
import path from 'path';
import findup from 'findup-sync';

export function getIgnoreRules(dir: string, root: string) {
  const ignoreFilePath = findup('.ignore', { cwd: dir });
  let ignoreRules = [] as string[];
  if (ignoreFilePath) {
    ignoreRules = fs
      .readFileSync(ignoreFilePath, { encoding: 'utf-8' })
      .split('\n')
      .filter(text => !text.startsWith('// '))
      .map(text => {
        const prefixPath = `${path.parse(ignoreFilePath.replace(/[\\]/g, '/')).dir
          }`.replace(root, '**');
        return `${prefixPath}/${text.replace(/[\s]*/g, '')}`;
      });
  }
  return ignoreRules;
}