import { Message } from "node-nats-streaming";
import { Listener,Subjects, OrderCreatedEvent } from "@digiteul/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    
    queueGroupName = queueGroupName;
    
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        // Find the ticket that the user is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, thow error
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Mark the ticket as being reserved by setting its orderId Property
        ticket.set(({ orderId: data.id}));

        // Save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        // Ack the message
        msg.ack();
    }
   
}