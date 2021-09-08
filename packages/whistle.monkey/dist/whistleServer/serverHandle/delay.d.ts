/// <reference types="node" />
import { Rule } from '@/interface/rule';
import http from 'http';
import { Request } from '@/interface/request';
export declare function handleDelay(request: http.IncomingMessage & Request, response: http.OutgoingMessage, rule: Rule, requestData: any): "next" | undefined;
