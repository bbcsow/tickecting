import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('Has a route handler listening to /api/ticekts for posts request ', async () => {
    const response = await request(app)
        .post("/api/tickets")
        .send({})
    
    expect(response.status).not.toEqual(404);
});


it('Can only be access if user is signed in', async () => {
  
    const response = await request(app)
        .post("/api/tickets")
        .send({})
        .expect(401);
});

it('Returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({})
    
    expect(response.status).not.toEqual(401);
});

it('Returns a error if an invalid title is provided', async () => {
  
    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: '', price: 120})
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: '             ', price: 120})
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({price: 120})
        .expect(400);
});


it('Returns a error if an invalid price is provided', async () => {
  
    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: 'dsdsds', price: 0})
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: 'ezzzzz', price: 'dd'})
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: 'ezzzzz', price: -10})
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: 'ezzzzz', price: 0})
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: 'ezzzzz'})
        .expect(400);
});


it('Create a tickets with valid inputs', async () => {
  
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: 'ezzzzz', price: 100})
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    
    if (1 <= tickets.length) {
        expect(tickets[0].title).toEqual('ezzzzz');
        expect(tickets[0].price).toEqual(100);
    }   

});


it('Publishes an event', async () => {

    await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title: 'ezzzzz', price: 100})
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();


});