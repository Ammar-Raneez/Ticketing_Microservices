import express from "express";

import { currentUser } from "@ar-personal/tickets-common";

const router = express.Router();

router.get("/api/users/current-user", currentUser, (req, res) => {
  return res.send({ currentUser: req.currentUser });
});

export { router as currentUserRouter };
