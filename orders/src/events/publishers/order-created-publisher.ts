import { Publisher,Subjects, OrderCreatedEvent } from "@digiteul/common";

export class OrderCreatedPublisher extends Publisher <OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}