import transform from "./transform";

it("transform", () => {
  const result = transform(
    "/server.server.ts",
    `export const test: string = method(test ?? 'test');`,
    { namespace: "server", srcDir: "/", restlessEndpoint: "test" }
  );

  console.log(result)
});
