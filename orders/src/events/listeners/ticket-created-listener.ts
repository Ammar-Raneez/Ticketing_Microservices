import { Message } from "node-nats-streaming";

import {
  Subjects,
  Listener,
  TicketCreatedEvent,
} from "@ar-personal/tickets-common";

import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./constants";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;

  // Ensure only one orders service will receive this event, avoiding duplicate processing
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });

    await ticket.save();

    // Acknowledge that the message was successfully processed (if not, another attempt would occur)
    msg.ack();
  }
}
