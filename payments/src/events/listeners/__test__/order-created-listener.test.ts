import mongoose  from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@digiteul/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from "../../../models/order";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);
  
    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'ddsdsdd',
        expiresAt: 'sdsds',
        ticket : { 
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 1000
        }
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };
  
    return { listener, data, msg };
};

it('Replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.id).toEqual(data.id);
    expect(order!.version).toEqual(data.version);
    expect(order!.status).toEqual(data.status);
    expect(order!.userId).toEqual(data.userId);
    expect(order!.price).toEqual(data.ticket.price);   
});


it('Acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
