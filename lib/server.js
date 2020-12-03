"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = exports.method = void 0;
const path = __importStar(require("path"));
const body_parser_1 = require("body-parser");
const fp = __importStar(require("fp-ts"));
const PathReporter = __importStar(require("io-ts/lib/PathReporter"));
const memoMap = new WeakMap();
const selectRequestContext = async (request, method) => {
    if (!memoMap.has(request)) {
        memoMap.set(request, new Map());
    }
    const selections = memoMap.get(request);
    if (!selections.has(method)) {
        selections.set(method, await method(request));
    }
    return selections.get(method);
};
exports.method = (description) => {
    return (async (...args) => {
        let params;
        let request;
        if (args.length > 1) {
            params = args[0];
            request = args[1];
        }
        else {
            params = {};
            request = args[0];
        }
        if (request == null) {
            throw new Error(`Expected request to be passed to restless methods when used on the server.`);
        }
        if (description.params != null) {
            const result = description.params.decode(params);
            fp.function.pipe(result, fp.either.mapLeft((error) => {
                const errors = PathReporter.failure(error);
                throw new Error(`Data Error:\n${errors.join("\n")}`);
            }));
        }
        const ctx = description.context != null
            ? Object.fromEntries(await Promise.all(Object.entries(description.context).map(async ([key, selectContext]) => {
                return [
                    key,
                    await selectRequestContext(request, selectContext),
                ];
            })))
            : {};
        return description.handler(params, ctx);
    });
};
exports.middleware = ({ namespace, getAPIModule }) => {
    return [
        body_parser_1.json(),
        async (req, res, next) => {
            var _a;
            const request = req.body;
            const args = request.args == null ? {} : request.args;
            const method = path.basename(request.id);
            const moduleId = path.dirname(request.id);
            const moduleName = `${moduleId}.${namespace}.ts`;
            const moduleObject = await getAPIModule(moduleName);
            try {
                const result = (_a = (await moduleObject[method](args, req))) !== null && _a !== void 0 ? _a : null;
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(result));
            }
            catch (e) {
                console.error(e);
                res.writeHead(500);
                res.end("Internal error");
            }
        },
    ];
};
