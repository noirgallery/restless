import { getOptions } from 'loader-utils';
import * as path from "path";
import assert from "assert";
import { parseTSScript } from "buntis";

const srcDir = path.join(__dirname, "src");

const makeRPCMethodClient = (path, name) => {
  const methodNamespace = path.relative(srcDir, path);
  const methodId = `${methodNamespace}/${name}`;
  const RPC_HOST = process.env.RPC_HOST;

  return `export function ${name} (...args) {
    return fetch(${JSON.stringify(
      RPC_HOST + "/__rpc"
    )}, { method: "POST", headers: {"Content-Type": "application/json"},  body: JSON.stringify({ id: ${JSON.stringify(
    methodId
  )}, args: args }) }).then(res => res.json())
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

export default function (content: string, map: any, meta: any) {
  const options = getOptions(this);
  const namespace = options.namespace == null || options.namespace.length === 0 ? 'server' : options.namespace;

  const serverPattern = new RegExp(`\.${namespace}\.[jt]s$`);
  const isServerModule =
    this.resourcePath.startsWith(srcDir) &&
    serverPattern.test(this.resourcePath);

  if (!isServerModule) {
    return content;
  }

  const source = parseTSScript(content);
  const names = [].concat(
    ...source.body.map((value) => {
      if (value.type === "ExportNamedDeclaration") {
        return (value.declaration as any).declarations.map((value: any) => {
          assert(
            value.id.type === "Identifier",
            "[noir.datstack] Server module export must not use destructuring syntax."
          );

          return value.id.name;
        });
      }

      return [];
    })
  );

  return names.map(value => makeRPCMethodClient(this.resourcePath, value)).join("\n");
};
