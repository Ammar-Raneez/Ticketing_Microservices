import { Message, Stan } from 'node-nats-streaming';

import { Subjects } from '../enums/subjects';

interface Event {
  subject: Subjects;
  data: any;
}

// Listener abstract class name
export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];

  abstract queueGroupName: string;

  abstract onMessage(data: T['data'], msg: Message): void;

  private client: Stan;

  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return (
      this.client
        .subscriptionOptions()

        // Default, events are automatically processed. Set manual acknowledgement mode to prevent loss of events (in case of db shutdown)
        .setManualAckMode(true)

        // Send all the events emitted in the past
        .setDeliverAllAvailable()

        // Wait for a specified time period till timeout
        .setAckWait(this.ackWait)

        // Ensure only the unprocessed events get processed again. Create a tag and associate processed events with the tag
        .setDurableName(this.queueGroupName)
    );
  }

  listen() {
    const subscription = this.client.subscribe(
      // Channel
      this.subject,

      // A queue group will ensure only one event is received by multiple instances of the same service, avoiding duplicate processing
      this.queueGroupName,
      this.subscriptionOptions(),
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}

