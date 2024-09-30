import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/Ticket";

it("Returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Ticket 01",
      price: 20,
    })
    .expect(404);
});

it("Returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Ticket 01",
      price: 20,
    })
    .expect(401);
});

it("Returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Ticket 01",
      price: 20,
    })
    .expect(201);

  // Test with a different cookie
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Another Ticket",
      price: 10,
    })
    .expect(401);
});

it("Returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Ticket 01",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Ticket 01",
      price: -10,
    })
    .expect(400);
});

it("Updates the ticket provided valid input", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Ticket 01",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Ticket 02",
      price: 100,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual("Ticket 02");
  expect(ticketResponse.body.price).toEqual(100);
});

it("Publishes an event", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Ticket 01",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Ticket 02",
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("Rejects updates if the ticket is reserved", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Ticket 01", price: 20 })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket?.save();

  // Updating a ticket with an order must be rejected
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "New title", price: 100 })
    .expect(400);
});
