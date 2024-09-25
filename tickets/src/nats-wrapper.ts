import nats, { Stan } from "node-nats-streaming";

// Create a Nats instance to be shared (similar to how Mongoose is shared throughout)
class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client)
      throw new Error("Cannot access NATS client before connecting");

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((res, rej) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS");
        res();
      });

      this.client.on("error", (err) => {
        rej(err);
      });
    });
  }
}

// Export a NatsWrapper singleton for access throughout the app
export const natsWrapper = new NatsWrapper();
