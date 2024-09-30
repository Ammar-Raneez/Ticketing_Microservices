import { Stan } from "node-nats-streaming";

import { Subjects } from "../types/subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];

  protected client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T["data"]): Promise<void> {
    // Allow async-await on call
    return new Promise((resolve, reject) => {
      this.client.publish(
        // Publish on channel subject
        this.subject,

        // JS Objects cannot be shared; therefore, stringify the object
        JSON.stringify(data),
        (err) => {
          if (err) return reject(err);

          console.log("Event published to subject", this.subject);
          resolve();
        },
      );
    });
  }
}
