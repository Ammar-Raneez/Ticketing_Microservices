import { Publisher } from "@ar-personal/tickets-common";
import { TicketCreatedEvent } from "@ar-personal/tickets-common";
import { Subjects } from "@ar-personal/tickets-common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
