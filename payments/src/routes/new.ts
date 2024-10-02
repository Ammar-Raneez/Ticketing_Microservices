import express, { Request, Response } from "express";
import { body } from "express-validator";

import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from "@ar-personal/tickets-common";

import { Order } from "../models/Order";
import { natsWrapper } from "../nats-wrapper";
import { stripe } from "../stripe";

const router = express.Router();
router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();

    // User should only be able to handle their own orders
    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

    // Reject payments on cancelled orders
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError("Cannot pay for a cancelled order");

    /*
     * Stripe API provides us with a token that can be used to bill a specific card card
     * We don't handle credit card details as Stripe API will handle it
     */

    // Create a charge a card based on a token.
    const charge = await stripe.charges.create({
      currency: "usd",

      // Stripe works on cents
      amount: order.price * 100,
      source: token
    });

    res.send({ success: true });
  },
);

export { router as createChargeRouter };
