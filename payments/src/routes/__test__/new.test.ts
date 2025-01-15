import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';




it('returns a 404 when purchasing an order that does not exist', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ token: 'dsdsds', orderId })
    .expect(404);
});


it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  
  const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      price: 20
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ token: 'dsdsds', orderId: order.id})
    .expect(401);
});


it('returns a 400 when purchasing a cancelled order', async () => {
  
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Cancelled,
      userId,
      price: 1000
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ token: 'dsdsds', orderId: order.id })
    .expect(400);
});


it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId,
      price
  });
  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', global.signin(userId))
  .send({ token: 'tok_visa', orderId: order.id })
  .expect(201);

  /*
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(price);
  expect(chargeOptions.currency).toEqual('usd');
  */
 
  const stripeCharges = await stripe.charges.list({limit: 10});
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });

  expect(payment).not.toBeNull();

});