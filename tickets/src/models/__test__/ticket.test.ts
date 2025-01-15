import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {

    // Create an instance of ticket
    const ticket = Ticket.build({title: 'concert', price: 20, userId: '123'});

    // Save the ticket to the DB
    await ticket.save();

    // Fetch the ticket twice
    const tickN01 = await Ticket.findById(ticket.id);
    const tickN02 = await Ticket.findById(ticket.id);

    // Make two separate changes to the tickets fetched
    tickN01!.set({price: 20});
    tickN02!.set({price: 50});

    // Save the first fetched ticket
    await tickN01!.save();

    // Save the second fetched ticket AN EXPECT AN ERROR
    try {
        await tickN02!.save();
      } catch (err) {
        return;
      }

      throw new Error('Should not reach this point');
});

it('icrements the version numbr of multiple saves', async () => {
     
     const ticket = Ticket.build({title: 'concert', price: 20, userId: '123'});

     // Save the ticket to the DB
     await ticket.save();
     expect(ticket.version).toEqual(0);

     await ticket.save();
     expect(ticket.version).toEqual(1);

     await ticket.save();
     expect(ticket.version).toEqual(2);

});
