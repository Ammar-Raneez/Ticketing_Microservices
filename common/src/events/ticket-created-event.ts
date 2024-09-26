import { Subjects } from "../types/subjects";

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;

  // Information on the created ticket needs to be received by the order service
  data: {
    id: string;
    title: string;
    price: number;
    userId: string;
    version: number;
  };
}
