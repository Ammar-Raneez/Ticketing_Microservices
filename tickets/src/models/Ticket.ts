/* Microservices are bound to run into concurrency issues
 * A user creates a ticket, they update it, they update it again
 * All events will be listened to by the orders service and processed on
 * If any of these events are processed in an incorrect order, its a huge issue
 * To alleviate this, a version can be used to keep track of the latest update
 * ex: If existing version in db is not consistent with the new version, don't process it
 * ticket created, v1. Update of v3 is in the queue before update of v2. Timeout this event, process v2 update. Re-process v3
 */

import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface TicketDoc extends mongoose.Document, TicketAttrs {
  // By default "__v" is present; however, the renamed one isn't
  version: number;

  // Track whether an order has been placed on a ticket
  orderId?: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

// Rename "__v" to version for readability
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin, { strategy: "version" });

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
  "Ticket",
  ticketSchema,
);
