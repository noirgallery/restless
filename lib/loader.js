"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = require("loader-utils");
const transform_1 = __importDefault(require("./transform"));
function default_1(content, map, meta) {
    const options = loader_utils_1.getOptions(this);
    return transform_1.default(this.resourcePath, content, options);
}
exports.default = default_1;
