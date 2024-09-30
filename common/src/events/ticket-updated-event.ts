import { Subjects } from "../types/subjects";

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;

  // Information on the updated ticket needs to be received by the order service
  data: {
    id: string;
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
  };
}
