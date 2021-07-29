import { Obj } from 'generate/interface';
export declare function addValue(key: string, value: any): void;
export declare function deleteValue(key: string): void;
export declare function clearScope(): void;
export declare function addScope(tScope?: Obj<any>): void;
export declare function deleteScope(tScope?: Obj<any>): void;
export declare function getScopeValue(key: string): any;
export declare function getScope(): {};
