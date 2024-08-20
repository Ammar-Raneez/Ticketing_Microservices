import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

// Globally, add a currentUser property to the Request object
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

// All requests will need to check if the user is logged in. Therefore, using a middleware is the best solution
export const currentUser = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  // Forward the request cycle without doing anything
  if (!req.session?.jwt) {
    return next();
  }

  try {
    // verify logged in credentials
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {}

  next();
}
