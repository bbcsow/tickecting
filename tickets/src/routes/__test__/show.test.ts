import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';


it('Return 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .get(`/api/tickets/${id}`)
        .send({})
        .expect(404);
});


it('Return the ticket if it is found', async () => {
  
    const [ title, price ] = [ 'Grand Bal 2025', 100 ];

    const response = await request(app)
        .post("/api/tickets")
        .set('Cookie', global.signin())
        .send({title, price})
        .expect(201);

        console.log(response);
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});
