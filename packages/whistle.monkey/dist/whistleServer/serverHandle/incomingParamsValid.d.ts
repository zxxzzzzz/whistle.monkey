/// <reference types="node" />
import { Rule } from '@/interface/rule';
import http from 'http';
import { Request } from '@/interface/request';
export declare function handleRequestDataMatch(request: http.IncomingMessage & Request, response: http.ServerResponse, rule: Rule, requestData: any): "next" | undefined;
