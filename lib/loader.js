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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = require("loader-utils");
const path = __importStar(require("path"));
const assert_1 = __importDefault(require("assert"));
const buntis_1 = require("buntis");
const srcDir = path.join(__dirname, "src");
const makeRPCMethodClient = (path, name) => {
    const methodNamespace = path.relative(srcDir, path);
    const methodId = `${methodNamespace}/${name}`;
    const RPC_HOST = process.env.RPC_HOST;
    return `export function ${name} (...args) {
    return fetch(${JSON.stringify(RPC_HOST + "/__rpc")}, { method: "POST", headers: {"Content-Type": "application/json"},  body: JSON.stringify({ id: ${JSON.stringify(methodId)}, args: args }) }).then(res => res.json())
  }`;
};
const schema = {
    type: 'object',
    properties: {
        namespace: {
            type: 'string'
        }
    }
};
function default_1(content, map, meta) {
    const options = loader_utils_1.getOptions(this);
    const namespace = options.namespace == null || options.namespace.length === 0 ? 'server' : options.namespace;
    const serverPattern = new RegExp(`\.${namespace}\.[jt]s$`);
    const isServerModule = this.resourcePath.startsWith(srcDir) &&
        serverPattern.test(this.resourcePath);
    if (!isServerModule) {
        return content;
    }
    const source = buntis_1.parseTSScript(content);
    const names = [].concat(...source.body.map((value) => {
        if (value.type === "ExportNamedDeclaration") {
            return value.declaration.declarations.map((value) => {
                assert_1.default(value.id.type === "Identifier", "[noir.datstack] Server module export must not use destructuring syntax.");
                return value.id.name;
            });
        }
        return [];
    }));
    return names.map(value => makeRPCMethodClient(this.resourcePath, value)).join("\n");
}
exports.default = default_1;
;
