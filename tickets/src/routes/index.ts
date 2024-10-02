import express, { Request, Response } from "express";

import { Ticket } from "../models/Ticket";

const router = express.Router();

router.get("/api/tickets", async (_: Request, res: Response) => {
  // Send only unbooked tickets as required by the client
  const tickets = await Ticket.find({
    orderId: undefined,
  });

  return res.send(tickets);
});

export { router as indexTicketRouter };
