import { Ticket } from "../Ticket";

it("Implements optimistic concurrency control", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: "Concert",
    price: 5,
    userId: "asdf",
  });

  await ticket.save();

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);

  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // Save the first ticket
  await firstInstance!.save();

  try {
    // Save the second ticket - this must produce an error as the secondInstance has the same version as the first (it must be an incremented value)
    await secondInstance!.save();
  } catch {
    return;
  }
});

it("Increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    userId: "asdf",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
