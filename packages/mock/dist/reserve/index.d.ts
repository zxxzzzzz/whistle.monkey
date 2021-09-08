/// <reference types="faker" />
import R from 'ramda';
import _ from 'lodash';
import dayjs from 'dayjs';
import validator from 'validator';
export declare function addFunction(key: string, value: Function): void;
export declare function deleteFunction(key: string): void;
export declare function getReserveFunc(): {
    R: typeof R;
    _: _.LoDashStatic;
    dayjs: typeof dayjs;
    faker: Faker.FakerStatic;
    v: typeof validator;
};
