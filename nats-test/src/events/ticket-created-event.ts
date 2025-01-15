import { Subjects } from './subjects';

export interface TicketCreatedEvent {
    subject: Subjects.TickectCreated;
    data : {
        id: string,
        title: string,
        price: number
    }
}
