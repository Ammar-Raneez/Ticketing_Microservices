import { randomBytes } from "crypto";
import nats, { Message } from "node-nats-streaming";

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

  const options = client
    .subscriptionOptions()

    // Default, events are automatically processed. Set manual acknowledgement mode to prevent loss of events (in case of db shutdown)
    .setManualAckMode(true)

    // Send all the events emitted in the past
    .setDeliverAllAvailable()
  
    // Ensure only the unprocessed events get processed again. Create a tag and associate processed events with the tag
    .setDurableName('ticketing-service');

  const subscription = client.subscribe(
    "ticket:created",

    // A queue group will ensure only one event is received by multiple instances of the same service, avoiding duplicate processing
    "listener-queue-group",
    options,
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }

    // Signal manual acknowledgement
    msg.ack();
  });
});

// Gracefully, shutdown
process.on("SIGINT", () => client.close());
process.on("SIGTERM", () => client.close());
