import mongoose  from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { Order, OrderStatus } from "./Order";

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
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
      min: 0,
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

// Manually handle versioning
//ticketSchema.pre("save", function(done) {
//  this.$where = {
//    version: this.get("version") - 1,
//  };
//
//  done();
//});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    // Mongoose will create a new "_id" value, remap this to ensure that the same id is used
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,

    // The version will be a higher version than the current existing one because an updated ticket will have a new version
    // For it to be the next event, it should be only one greater
    version: event.version - 1,
  });
};

// If the ticket is in any state but Cancelled, it is currently reserved and cannot be accessed by another person
ticketSchema.methods.isReserved = async function() {
  const existingOrder = await Order.findOne({
    // "this" works only for named functions
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
