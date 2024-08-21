import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

let mongo: any;

// Run before all the tests
beforeAll(async () => {
  process.env.JWT_KEY = 'local-test-key';
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
