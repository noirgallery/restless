import { expect } from "chai";
import express from "express";
import { createServer, Server } from "http";
import request from "supertest";
import { middleware } from "./server";

// --------------------------------------------------
// variables

// --------------------------------------------------
// test suite

describe("server", () => {
  let app: ReturnType<typeof express>;
  let server: Server;

  before(() => {
    app = express();
    server = createServer(app);
  });
  after(() => {
    server.close();
  });

  describe("middlewares", () => {
    it("runs", async () => {
      app.use(
        "/__rpc",
        ...middleware({
          getAPIModule: (moduleName) => require(`./spec/${moduleName}`),
          namespace: "test",
        })
      );

      // make the request
      const { body } = await request(server)
        .post(`/__rpc`)
        .send({
          id: "module/foo",
          args: { arg1: "foo", arg2: "bar" },
        })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(body).equal("foo:bar");
    });
  });
});
