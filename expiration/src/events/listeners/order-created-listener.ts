import { Message } from "node-nats-streaming";

import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@ar-personal/tickets-common";

import { queueGroupName } from "./constants";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expirationQueue.add({ orderId: data.id }, { delay });

    msg.ack();
  }
}
