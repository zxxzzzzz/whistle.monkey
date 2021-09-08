/// <reference types="node" />
import http from 'http';
import { Request } from '@/interface/request';
export declare function handleCors(request: http.IncomingMessage & Request, response: http.OutgoingMessage): string;
