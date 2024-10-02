import { Message } from "node-nats-streaming";

import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
  OrderStatus,
} from "@ar-personal/tickets-common";

import { queueGroupName } from "./constants";
import { Order } from "../../models/Order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) throw new Error("Order not found");

    // Prevent cancellation of orders paid for
    if (order.status === OrderStatus.Complete) return msg.ack();

    // Don't remove the ticket so cancelled tickets can be found
    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
