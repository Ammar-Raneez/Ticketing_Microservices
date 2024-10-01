import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from "@ar-personal/tickets-common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
