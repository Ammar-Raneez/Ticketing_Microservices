import { Publisher, OrderCancelledEvent, Subjects } from "@ar-personal/tickets-common";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
   subject: Subjects.OrderCancelled = Subjects.OrderCancelled; 
}
