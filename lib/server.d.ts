/// <reference types="connect" />
import * as t from "io-ts";
export * from "./errors";
export interface MethodDescription<Params extends t.Any, Result, Ctx extends {
    [key: string]: (req: any) => any;
}> {
    params?: Params;
    context?: Ctx;
    handler: (params: t.TypeOf<Params>, ctx: {
        [key in keyof Ctx]: Ctx[key] extends (value: any) => infer ret ? ret : never;
    }) => Promise<Result> | Result;
}
export declare const method: <R, Ctx extends {
    [key: string]: (req: any) => any;
}, P extends t.Any = t.NeverC>(description: MethodDescription<P, R, Ctx>) => P extends t.NeverC ? (request?: Ctx[keyof Ctx] extends (arg: infer arg) => any ? arg : never) => Promise<R> : (params: t.TypeOf<P>, request?: Ctx[keyof Ctx] extends (arg: infer arg_1) => any ? arg_1 : never) => Promise<R>;
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
