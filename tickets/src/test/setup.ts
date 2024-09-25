import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: any;

declare global {
  var signin: () => string[];
}

// Jest redirect imports. Create a file with the same name as the file to be mocked
// Which will redirect nats wrapper import to the mocked nats wrapper
jest.mock("../nats-wrapper");

beforeAll(async () => {
  process.env.JWT_KEY = "local-test-key";
  mongo = await MongoMemoryServer.create();
  const mongoURI = mongo.getUri();

  await mongoose.connect(mongoURI);
}, 10000);

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  if (collections) {
    for (let collection of collections) {
      await collection?.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});

global.signin = () => {
  // Create a fake token for use in the test environment
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  // Create base64 encoded string 
  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};
