import { getOptions } from "loader-utils";
import transform from "./transform";

export default function (content: string, map: any, meta: any) {
  const options = getOptions(this) as any;
  return transform(this.resourcePath, content, options);
}
