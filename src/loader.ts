import { getOptions } from "loader-utils";
import * as Path from "path";
import assert from "assert";
import { parseTSScript } from "buntis";

const makeRPCMethodClient = (srcDir, path, name) => {
  const methodNamespace = Path.relative(srcDir, path);
  const methodId = `${methodNamespace}/${name}`;
  const RPC_HOST = process.env.RPC_HOST;

  return `export function ${name} (params) {
    return fetch(${JSON.stringify(
      RPC_HOST + "/__rpc"
    )}, { method: "POST", credentials: 'include', headers: {"Content-Type": "application/json"},  body: JSON.stringify({ id: ${JSON.stringify(
    methodId
  )}, args: params }) }).then(res => { 
    if (res.status === 200) {
      return res.json()
    } else {
      return res.text().then(text => {
        throw new Error('API Error: ' + ${JSON.stringify(
          methodId
        )} + ': ' + text)
      })
    }
  })
  }`;
};

const schema = {
  type: "object",
  properties: {
    namespace: {
      type: "string",
    },
  },
};

export default function (content: string, map: any, meta: any) {
  const options = getOptions(this);
  const namespace =
    options.namespace == null || options.namespace.length === 0
      ? "server"
      : options.namespace;
  const srcDir = options.srcDir;

  const serverPattern = new RegExp(`\.${namespace}\.[tj]s$`);
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
            "[restless] Server module export must not use destructuring syntax."
          );

          return value.id.name;
        });
      }

      return [];
    })
  );

  return names
    .map((value) =>
      makeRPCMethodClient(
        srcDir,
        this.resourcePath.replace(serverPattern, ""),
        value
      )
    )
    .join("\n");
}
