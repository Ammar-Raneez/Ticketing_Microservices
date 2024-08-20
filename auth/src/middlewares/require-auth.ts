import { Request, Response, NextFunction } from "express";

import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requireAuth = (req: Request, _: Response, next: NextFunction) => {
  // If there isn't a current user, show a not authorized exception
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  next();
};
