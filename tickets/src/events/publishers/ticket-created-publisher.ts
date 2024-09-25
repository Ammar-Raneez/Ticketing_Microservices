import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@ar-personal/tickets-common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
