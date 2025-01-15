import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';


it('Return a 404 if the provided ID not exists', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({title: 'jdjsds', price: 20})
        .expect(404);
});


it('Returns a 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({title: 'jdjsds', price: 20})
        .expect(401);
});


it('Returns a 401 if user is does not own the ticket', async () => {
    
    const response = await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: 'ezzzzz', price: 100});

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({title: 'ezzzzz 2', price: 102})
        .expect(401);

});


it('Returns a 400 if user provides an invalid title or price', async () => {

    const cookie = global.signin()

    const response = await request(app)
        .post("/api/tickets")
        .set('Cookie', cookie)
        .send({title: 'yyyyyy', price: 100});

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title: '', price: 102})
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title: 'dsdss', price: -2})
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title: '', price: 0})
        .expect(400);
});


it('Updates the ticket provided with valid inputs', async () => {
    const cookie = global.signin()
    const title = 'Grand Bal';
    const price = 15;

    const response = await request(app)
        .post("/api/tickets")
        .set('Cookie', cookie)
        .send({title: 'yyyyyy', price: 100});

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title, price})
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();
    
    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});


it('rejects updates for a reserved ticket', async () => {
    const cookie = global.signin()
   
    const response = await request(app)
        .post("/api/tickets")
        .set('Cookie', cookie)
        .send({title: 'asldkfj', price: 20});

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title: 'nouveau', price: 100})
        .expect(400);
});

