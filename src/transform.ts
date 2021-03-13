import assert from "assert";
import { parseTSScript } from "buntis";
import * as Path from "path";

const makeRPCMethodClient = (srcDir, path, name, rpcEndpoint) => {
  const methodNamespace = Path.relative(srcDir, path);
  const methodId = `${methodNamespace}/${name}`;
  const RPC_HOST = process.env.RPC_HOST;

  return `export function ${name} (params) {
    return fetch(${JSON.stringify(
      rpcEndpoint
    )}, { method: "POST", credentials: "include", headers: {"Content-Type": "application/json"},  body: JSON.stringify({ id: ${JSON.stringify(
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

export default function (
  resourcePath: string,
  code: string,
  options: {
    namespace: string;
    srcDir: string;
    restlessEndpoint: string;
  }
) {
  const namespace =
    options.namespace == null || options.namespace.length === 0
      ? "server"
      : options.namespace;
  const srcDir = options.srcDir;
  const endpoint = options.restlessEndpoint;

  const serverPattern = new RegExp(`\.${namespace}\.[tj]s$`);
  const isServerModule =
    resourcePath.startsWith(srcDir) && serverPattern.test(resourcePath);

  if (!isServerModule) {
    return code;
  }

  const source = parseTSScript(code);
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
        resourcePath.replace(serverPattern, ""),
        value,
        endpoint
      )
    )
    .join("\n");
}
