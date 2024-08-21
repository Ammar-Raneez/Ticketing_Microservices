import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "../app";

let mongo: any;

// signin will either return a array of strings or undefined
declare global {
  var signin: () => Promise<string[] | undefined>;
}

// Run before all the tests
beforeAll(async () => {
  process.env.JWT_KEY = "local-test-key";
  mongo = await MongoMemoryServer.create();
  const mongoURI = mongo.getUri();

  await mongoose.connect(mongoURI);
});

// Clear collections before each test
beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  if (collections) {
    for (let collection of collections) {
      await collection?.deleteMany({});
    }
  }
});

// Close Mongo connection after all tests
afterAll(async () => {
  if (mongo) await mongo.stop();

  await mongoose.connection.close();
});

// Create a global signin function available in the test environment
// Supertest does not pass cookies like postman/browser. Therefore, the logged in cookie is required
global.signin = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  const cookie = response.get('Set-Cookie');
  return cookie;
};
