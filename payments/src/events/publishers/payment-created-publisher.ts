import { Publisher,Subjects, PaymentCreatedEvent } from "@digiteul/common";

export class PaymentCreatedPublisher extends Publisher <PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}