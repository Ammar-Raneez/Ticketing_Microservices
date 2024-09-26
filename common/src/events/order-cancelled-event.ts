import { Subjects } from "../types/subjects";

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    ticket: {
      // Which ticket is unreserved and can be edited
      // Which order's payment must be rejected
      id: string;
    };
  };
}
