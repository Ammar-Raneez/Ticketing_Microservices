import { Message } from "node-nats-streaming";

import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@ar-personal/tickets-common";

import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/Ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) throw new Error("Ticket not found");

    // Mark the ticket as being reserved
    ticket.set({ orderId: data.id });

    await ticket.save();

    // Publish ticket update event for orders service to sync
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    msg.ack();
  }
}
