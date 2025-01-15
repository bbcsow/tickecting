import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

const createTicket = async () => {
    await request(app)
    .post("/api/tickets")
    .set('Cookie', global.signin())
    .send({title: 'ezzzzz', price: 100})
    .expect(201);
}

it('Can fecth list of tickets', async () => {
    
  await createTicket();
  await createTicket();
  await createTicket();
  
  const response = await request(app)
    .get(`/api/tickets`)
    .send()
    .expect(200);

    expect(response.body.length).toEqual(3);

});
