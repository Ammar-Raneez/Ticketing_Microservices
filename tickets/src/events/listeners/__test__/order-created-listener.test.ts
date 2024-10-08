import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { OrderCreatedEvent, OrderStatus } from "@ar-personal/tickets-common";

import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: "Concert",
    price: 99,
    userId: "asdf",
  });

  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "asdf",
    expiresAt: "asdf",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("Sets the userId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("Acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("Publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  /*      
    console.log((natsWrapper.client.publish as jest.Mock).mock.calls);
    [
        [
          'ticket:updated',
          '{"id":"66fa6a8f5d114d42203d1c27","price":99,"title":"Concert","userId":"asdf","orderId":"66fa6a8f5d114d42203d1c29","version":1}',
          [Function (anonymous)]
        ]
    ]
  */

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
