import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@ar-personal/tickets-common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
