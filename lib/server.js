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
exports.middlewares = void 0;
const path = __importStar(require("path"));
const body_parser_1 = require("body-parser");
exports.middlewares = (moduleRootDir, namespace) => {
    return [
        body_parser_1.json(),
        async (req, res, next) => {
            const request = req.body;
            const args = request.args == null ? [] : request.args;
            const method = path.basename(request.id);
            const moduleName = path.dirname(request.id);
            const src = path.resolve(moduleRootDir, `${moduleName}.${namespace}.ts`);
            const moduleObject = await Promise.resolve().then(() => __importStar(require(src)));
            const result = await moduleObject[method](...args);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
        }
    ];
};
