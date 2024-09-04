import nats from "node-nats-streaming";

console.clear();

const client = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

client.on("connect", () => {
  console.log("Publisher connected to NATS");

  // JS Objects cannot be shared; therefore, stringify the object
  const ticket = JSON.stringify({
    id: '123',
    title: 'Concert',
    price: 20,
  });

  // Share the ticket message on a channel called ticket:created
  client.publish('ticket:created', ticket, () => {
    console.log('Event published');
  })
});
