import * as path from 'path';
import request from 'supertest';
import express from 'express';
import { Server, createServer } from 'http';
import { expect } from 'chai';
import { middlewares } from './server';

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

  describe('middlewares', () => {
    it('runs', async() => {
      app.use('/__rpc', ...middlewares(path.resolve(__dirname, 'spec'), 'test'));

       // make the request
       const { body } = await request(server)
       .post(`/__rpc`)
       .send({
         id: 'module/foo',
         args: ['foo', 'bar']
       })
       .expect('Content-Type', /json/)
       .expect(200);

       expect(body).equal('foo:bar');
    });
  });
});
