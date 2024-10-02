import { Message } from "node-nats-streaming";

import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from "@ar-personal/tickets-common";

import { queueGroupName } from "./constants";
import { Order } from "../../models/Order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error("Order not found");

    // Order is complete on payment
    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    /*
      * On update of an order, the version number will increment, and as an event isn't published on that update
      * There can be a inconsistency of order versions across other services. Best thing to do is to emit an order updated
      * Event for other services to increment the version number; however, this isn't required once an order is completed in the context of this App
    */

    msg.ack();
  }
}
