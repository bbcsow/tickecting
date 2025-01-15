import { Message } from "node-nats-streaming";
import { Listener,Subjects, OrderCancelledEvent } from "@digiteul/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    
    queueGroupName = queueGroupName;
    
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {

        // Find the ticket that the user is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, thow error
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Mark the ticket is no more resverved by setting orderId property to UNDEFINED
        ticket.set(({ orderId: undefined}));

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