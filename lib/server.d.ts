/// <reference types="connect" />
import * as t from "io-ts";
export * from "./errors";
declare type ContextSelectors<Ctx> = {
    [key in keyof Ctx]: (request: any) => Promise<Ctx[key]> | Ctx[key];
};
export interface MethodDescription<Params extends t.Any, Result, Ctx> {
    params?: Params;
    context?: ContextSelectors<Ctx>;
    handler: (params: t.TypeOf<Params>, ctx: Ctx) => Promise<Result> | Result;
}
export declare const method: <R, C, P extends t.Any = t.NeverC>(description: MethodDescription<P, R, C>) => P extends t.NeverC ? (request?: any) => Promise<R> : (params: t.TypeOf<P>, request?: any) => Promise<R>;
export interface RestlessOptions {
    namespace: string;
    getAPIModule: (moduleName: string) => any;
}
export declare const getMethodResponse: ({ getAPIModule, namespace }: RestlessOptions, request: any, req: any) => Promise<any>;
export declare const socket: (options: RestlessOptions) => {
    idleTimeout: number;
    open(ws: any): void;
};
export declare const middleware: (options: RestlessOptions) => import("connect").NextHandleFunction[];
