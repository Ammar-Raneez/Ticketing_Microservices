import { Publisher, OrderCreatedEvent, Subjects } from "@ar-personal/tickets-common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
   subject: Subjects.OrderCreated = Subjects.OrderCreated; 
}

