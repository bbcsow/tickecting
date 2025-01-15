import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string, price: number) => {
    const ticket = Ticket.build({ 
        id: new mongoose.Types.ObjectId().toString('hex'),
        title, 
        price });
    await ticket.save();

    return ticket;
}


it('Return error if order not exists', async () => {

    // Creeate a ticket
    const ticket = await buildTicket('Manga 2', 10);

    // Make a request to build a request with the ticket
    const user = global.signin();

    const {body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make request to fetch a different order
    const orderId = new mongoose.Types.ObjectId().toString('hex');

    const {body: fecthOrder } = await request(app)
        .get(`/api/orders/:${orderId}`)
        .set('Cookie', user)
        .send()
        .expect(400);
    
});


it('Return error if an user tries to fetch another users order', async () => {

    // Creeate a ticket
    const ticket = await buildTicket('Modou LO', 10);

    // Make a request to build a request with the ticket
    const userOne = global.signin();
    const userTwo = global.signin();

    const {body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make request to fetch the order
    const {body: fecthOrder } = await request(app)
        .get(`/api/orders/:${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(400);
});