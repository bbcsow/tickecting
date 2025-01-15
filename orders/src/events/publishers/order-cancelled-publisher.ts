import { Publisher,Subjects, OrderCancelledEvent } from "@digiteul/common";

export class OrderCancelledPublisher extends Publisher <OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}