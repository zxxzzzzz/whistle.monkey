import path from 'path';
import { getRule, query, disableRule, enableRule } from '@/file/rule';
import micromatch from 'micromatch';
import { SharedStore } from '@/file/interface';
import { getIgnoreRules } from '@/utils/ignore';


export async function handleIgnore(store: SharedStore) {
  const { _path, root } = store
  const parsedPath = path.parse(_path);
  if (parsedPath.name === '.ignore') {
    const ignoreRules = getIgnoreRules(parsedPath.dir, root);
    query(['**']).forEach(filePath => {
      const rule = getRule(filePath);
      if (
        rule?.disabled === true &&
        !micromatch.isMatch(filePath, ignoreRules)
      ) {
        enableRule(filePath);
        global.sendLog({
          message: `启用了模板<span class="text-pink-500">${filePath}</span>`,
          type: 'success',
          tags: ['启用'],
        });
        return;
      }
      if (
        rule?.disabled === false &&
        micromatch.isMatch(filePath, ignoreRules)
      ) {
        disableRule(filePath);
        global.sendLog({
          message: `禁用了模板<span class="text-pink-500">${filePath}</span>`,
          type: 'warning',
          tags: ['禁用'],
        });
      }
    });
  }
}