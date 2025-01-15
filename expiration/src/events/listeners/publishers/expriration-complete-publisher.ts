import { Publisher,Subjects, ExpirationCompleteEvent } from "@digiteul/common";

export class ExpirationCompletePublisher extends Publisher <ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}