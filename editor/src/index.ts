import monaco from 'monaco-editor';

monaco.editor.create(document.querySelector('#container') as HTMLElement, 
{language:'yaml',value:'me: 123 \r\n mr: 123',quickSuggestions: { other: true, strings: true }})
monaco.languages.registerCompletionItemProvider('yaml',{
  provideCompletionItems(model,position){
    const word = model.getWordUntilPosition(position);
    const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
    };
    return {
      suggestions:[...getDayJsSuggestions(range)]
    }
  }
})

// 获取 dayjs的suggestions
function getDayJsSuggestions(range:monaco.IRange): monaco.languages.CompletionItem[]{
  return [
    {
      label:'dayjs',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: "Describe your library here",
      insertText: 'dayjs()',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range
    }
  ]
}