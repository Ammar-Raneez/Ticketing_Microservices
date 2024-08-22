
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "../app";

let mongo: any;

declare global {
  var signin: () => Promise<string[] | undefined>;
}

beforeAll(async () => {
  process.env.JWT_KEY = "local-test-key";
  mongo = await MongoMemoryServer.create();
  const mongoURI = mongo.getUri();

  await mongoose.connect(mongoURI);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  if (collections) {
    for (let collection of collections) {
      await collection?.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) await mongo.stop();

  await mongoose.connection.close();
});

