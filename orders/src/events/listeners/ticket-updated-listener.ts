import { Message } from "node-nats-streaming";

import {
  Subjects,
  Listener,
  TicketUpdatedEvent,
} from "@ar-personal/tickets-common";

import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./constants";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) throw new Error("Ticket not found");

    const { title, price } = data;

    ticket.set({
      title,
      price,
    });

    // Manual version update
    // const { title, price, version } = data;
    // ticket.set({ title, price, version });

    await ticket.save();

    msg.ack();
  }
}
