import { Message } from "node-nats-streaming";
import mongoose, { mongo, Mongoose } from "mongoose";
import { ExpirationCompleteEvent, OrderStatus } from "@digiteul/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order } from "../../../models/order";


const setup = async () => {

  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'ffdfdf',
    expiresAt: new Date(),
    ticket      
  });
  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};
  

it('Updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder =  await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
  

it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(eventData.id).toEqual(order.id);
});


it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
