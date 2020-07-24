import * as path from "path";
import { json } from "body-parser";

export const middlewares = (moduleRootDir: string, namespace: string) => {
  return [
    json(),
    async (req, res, next) => {
      const request = req.body;
      const args = request.args == null ? [] : request.args;
      const method = path.basename(request.id);
      const moduleName = path.dirname(request.id);

      const src = path.resolve(moduleRootDir, `${moduleName}.${namespace}.ts`);
      const moduleObject = await import(src);
      const result = await moduleObject[method](...args);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    }
  ];
};