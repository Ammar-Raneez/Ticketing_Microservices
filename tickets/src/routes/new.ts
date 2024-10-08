import express, { Request, Response } from "express";
import { body } from "express-validator";

import { requireAuth, validateRequest } from "@ar-personal/tickets-common";

import { Ticket } from "../models/Ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    /*
     * Upon publishing a ticket, an error could occur (ex: a ticket was created, but an event wasn't published)
     * Solving this would utlize a separate collection storing the events with a status on whether it's sent
     * Therefore, if NATS goes down, it can check the collection and process unprocessed events
     */
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    return res.status(201).send(ticket);
  },
);

export { router as createTicketRouter };
