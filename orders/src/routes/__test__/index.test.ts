import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string, price: number) => {
    const ticket = Ticket.build({id: new mongoose.Types.ObjectId().toString('hex'), title, price });
    await ticket.save();

    return ticket;
}


it('Fetches orders for a particular user', async () => {

    // Creeate 3 tickets
    const ticketOne = await buildTicket('Youssou NDOUR', 10);
    const ticketTwo = await buildTicket('Papa WEMBA', 20);
    const ticketThree = await buildTicket('2PAC', 30);

    const userOne = global.signin();
    const userTwo = global.signin();

    // Create one order as User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    // Create one order as User #2
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);

    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .send()
        .expect(200);

        
    // Make sure we got only the orders for User #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);

});
