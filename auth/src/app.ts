import express from "express";
import "express-async-errors";

import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError } from "@ar-personal/tickets-common";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

const app = express();

// trust the nginx configuration
app.set("trust proxy", true);
app.use(json());

// do not encrypt cookie details as the JWT is by itself tamper resistant
// instance where multiple languages are used for the backend, the encryption mechanism must be known
app.use(
  cookieSession({
    signed: false,
    secure: false,
    // Only send cookies on an HTTPS connection (supertest uses HTTP). Jest sets NODE_ENV to test on run
    //secure: process.env.NODE_ENV !== "test",
  }),
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

// separate app into two files so that testing is easier
