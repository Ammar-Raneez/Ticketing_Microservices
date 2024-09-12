import { randomBytes } from "crypto";
import nats from "node-nats-streaming";

import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();

// Create clients with a unique ID value (IDs are unique)
const client = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

client.on("connect", () => {
  console.log("Listener connected to NATS");

  // Signal NATS server that this client is closed and stop sending events to it
  client.on("close", () => {
    console.log("NATS connected closed!");
    process.exit();
  });

  new TicketCreatedListener(client).listen();
});

// Gracefully, shutdown
process.on("SIGINT", () => client.close());
process.on("SIGTERM", () => client.close());
