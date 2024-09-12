import { Message } from "node-nats-streaming";

import { Listener } from "@ar-personal/tickets-common";
import { TicketCreatedEvent } from "@ar-personal/tickets-common";
import { Subjects } from "@ar-personal/tickets-common";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log("Event data", data);

    // Signal manual acknoledgement
    msg.ack();
  }
}
