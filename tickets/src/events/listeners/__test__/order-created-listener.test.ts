import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose, { mongo, Mongoose, now } from "mongoose";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@digiteul/common";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);
  
    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 99,
        userId: 'asdf'
    });

    await ticket.save();

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'ddsdsdd',
        expiresAt: (new Date()).toISOString(),
        ticket : { 
            id: ticket.id,
            price: ticket.price
        }
    };
  
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };
  
    return { listener, ticket, data, msg };
};

it('Sets the userId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const reservedTicket = await Ticket.findById(ticket.id);

    expect(reservedTicket!.orderId).toEqual(data.id);
    
});


it('Acks the message', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});


it('Publishes a ticket updated even', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // @ts-ignore
    console.log(natsWrapper.client.publish!.mock.calls);
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdatedData.orderId);
});