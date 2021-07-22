import * as monaco from "monaco-editor";


const DEFAULT_YAML = 
`match:
  path:
body:`

export function initYaml(cssSelector:string) {
  monaco.editor.create(document.querySelector(cssSelector) as HTMLElement, {
    language: "yaml",
    value: DEFAULT_YAML
,
    quickSuggestions: { other: true, strings: true },
  });
}

monaco.languages.registerCompletionItemProvider("yaml", {
  async provideCompletionItems(model, position) {
    const word = model.getWordUntilPosition(position);
    console.log(word, position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };
    return {
      suggestions: [
        ...(await getDayJsSuggestions(range)),
        ...getBuiltInSuggestions(range)
      ],
    };
  },
});
// 获取 dayjs的suggestions
async function getDayJsSuggestions(
  range: monaco.IRange
): Promise<monaco.languages.CompletionItem[]> {
  return [
    {
      label: "dayjs",
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: "dayjs的api",
      insertText: "dayjs()",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    },
  ];
}
// 获取 内置的代码提示
function getBuiltInSuggestions(
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return [
    {
      label: "index",
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: "循环的index,从0开始",
      insertText: "index",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    },
  ];
}

const dayjsDTS = `
export = dayjs;

declare function dayjs (date?: dayjs.ConfigType): dayjs.Dayjs

declare function dayjs (date?: dayjs.ConfigType, format?: dayjs.OptionType, strict?: boolean): dayjs.Dayjs

declare function dayjs (date?: dayjs.ConfigType, format?: dayjs.OptionType, locale?: string, strict?: boolean): dayjs.Dayjs

declare namespace dayjs {
  export type ConfigType = string | number | Date | Dayjs

  export type OptionType = { locale?: string, format?: string, utc?: boolean } | string | string[]

  export type UnitTypeShort = 'd' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms'

  export type UnitTypeLong = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'date'

  export type UnitTypeLongPlural = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years' | 'dates'
  
  export type UnitType = UnitTypeLong | UnitTypeLongPlural | UnitTypeShort;

  export type OpUnitType = UnitType | "week" | "weeks" | 'w';
  export type QUnitType = UnitType | "quarter" | "quarters" | 'Q';

  class Dayjs {
    constructor (config?: ConfigType)
    clone(): Dayjs
    isValid(): boolean
  
    year(): number
  
    year(value: number): Dayjs
   
    month(): number
  
    month(value: number): Dayjs
  
    date(): number
  
    date(value: number): Dayjs
  
    day(): number
   
    day(value: number): Dayjs
  
    hour(): number
   
    hour(value: number): Dayjs
  
    minute(): number
   
    minute(value: number): Dayjs
   
    second(): number
   
    second(value: number): Dayjs
   
    millisecond(): number
  
    millisecond(value: number): Dayjs
   
    set(unit: UnitType, value: number): Dayjs
   
    get(unit: UnitType): number
   
    add(value: number, unit?: OpUnitType): Dayjs
   
    subtract(value: number, unit?: OpUnitType): Dayjs
  
    startOf(unit: OpUnitType): Dayjs
   
    endOf(unit: OpUnitType): Dayjs
   
    format(template?: string): string
   
    diff(date: ConfigType, unit?: QUnitType | OpUnitType, float?: boolean): number
   
    valueOf(): number
   
    unix(): number
    
    daysInMonth(): number
   
    toDate(): Date
   
    toJSON(): string
   
    toISOString(): string
   
    toString(): string
   
    utcOffset(): number
   
    isBefore(date: ConfigType, unit?: OpUnitType): boolean
  
    isSame(date: ConfigType, unit?: OpUnitType): boolean
   
    isAfter(date: ConfigType, unit?: OpUnitType): boolean

    locale(): string

    locale(preset: string | ILocale, object?: Partial<ILocale>): Dayjs
  }

  export type PluginFunc<T = unknown> = (option: T, c: typeof Dayjs, d: typeof dayjs) => void

  export function extend<T = unknown>(plugin: PluginFunc<T>, option?: T): Dayjs

  export function locale(preset?: string | ILocale, object?: Partial<ILocale>, isLocal?: boolean): string

  export function isDayjs(d: any): d is Dayjs

  export function unix(t: number): Dayjs

  const Ls : { [key: string] :  ILocale }
}`


// monaco.languages.typescript.typescriptDefaults.addExtraLib(dayjsDTS, 'ts:filename/dayjs.d.ts')