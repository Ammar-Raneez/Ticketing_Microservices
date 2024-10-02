import mongoose from "mongoose";
import request from "supertest";

import { OrderStatus } from "@ar-personal/tickets-common";

import { app } from "../../app";
import { Order } from "../../models/Order";
import { stripe } from "../../stripe";

//jest.mock("../../stripe");

it("Returns a 404 when purchasing an order that doesn't exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asdf",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("Returns a 401 when purchasing an order that doesn't belong to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),

    // Some other userId not equal to the logged on user
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asdf",
      orderId: order.id,
    })
    .expect(401);
});

it("Returns a 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      orderId: order.id,
      token: "asdf",
    })
    .expect(400);
});

it("Creates a successful charge with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 1000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  // Fake Stripe API
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargeOptions.source).toEqual("tok_visa");
  // expect(chargeOptions.amount).toEqual(price * 100);
  // expect(chargeOptions.currency).toEqual("usd");

  // Utilizing the real Stripe API. Get the 1st 50 charges and find the charge placed
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(
    (charge) => charge.amount === price * 100,
  );

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual("usd");
});
