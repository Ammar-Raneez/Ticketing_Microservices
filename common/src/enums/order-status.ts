export enum OrderStatus {
  // Order is created but the ticket isn't reserved yet
  Created = "created",

  // Ticket is already reserved, or the user cancels the order, or the order expires before payment
  Cancelled = "cancelled",

  // The order has successfully reserved the ticket
  AwaitingPayment = "awaiting:payment",

  // Order has reserved the ticket and the payment has been provided
  Complete = "complete",
}
