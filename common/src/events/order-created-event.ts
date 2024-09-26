import { OrderStatus } from "../types/order-status";
import { Subjects } from "../types/subjects";

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;

  // Information on the order, and what ticket it was placed
  data: {
    id: string;
    status: OrderStatus;
    version: number;
    
    // Required by the payment service to understand who placed the order
    userId: string;

    // Required by the expiration service
    expiresAt: string;

    // Required by the ticket service (which ticket has been ordered)
    ticket: {
      id: string;
      price: number;
    };
  };
}
