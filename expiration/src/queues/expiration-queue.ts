/* Bulljs is a web server that will use worker servers to perform tasks
 * Bull queues jobs and sends a job to a redis server which will store a list of jobs
 * A set of worker servers will poll the redis server for jobs, perform the action, and let redis know it has completed the job
 * Setting the initial job, processing the job, and notifying on completion is all done by bull
 * The delaying aspect of bull can be used to handle the expiration
 */

import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  },
});

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  })
});

export { expirationQueue };
