import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { OrderCancelledEvent, OrderStatus } from "@digiteul/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/order";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
  
    // Create an order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'ddsdsdd',
        price: 1000
    });
    await order.save();

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket : { 
            id: new mongoose.Types.ObjectId().toHexString()
        }
    };
  
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };
  
    return { listener, order, data, msg };
};

it('Updates order status to cancelled', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});


it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
