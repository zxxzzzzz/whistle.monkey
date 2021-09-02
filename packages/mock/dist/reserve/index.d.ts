/// <reference types="faker" />
import R from 'ramda';
import _ from 'lodash';
import dayjs from 'dayjs';
export declare function addFunction(key: string, value: Function): void;
export declare function deleteFunction(): void;
export declare function getReserveFunc(): {
    [Symbol.iterator](): IterableIterator<Function>;
    next(...args: [] | [undefined]): IteratorResult<Function, any>;
    return?(value?: any): IteratorResult<Function, any>;
    throw?(e?: any): IteratorResult<Function, any>;
    R: typeof R;
    _: _.LoDashStatic;
    dayjs: typeof dayjs;
    faker: Faker.FakerStatic;
};
