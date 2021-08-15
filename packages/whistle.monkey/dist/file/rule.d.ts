import { Rule } from './interface';
export declare function addRule(key: string, rule: Rule): void;
export declare function updateRule(key: string, rule: Rule): void;
export declare function deleteRule(key: string): void;
export declare function disableRule(key: string): void;
export declare function enableRule(key: string): void;
export declare function getRule(key: string): Rule | undefined;
export declare function getRuleByUrl(url: string): Rule | undefined;
export declare function query(queryList: string[]): string[];
