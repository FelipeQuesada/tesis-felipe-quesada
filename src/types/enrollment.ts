export type EnrollmentStatus = 'pending_payment' | 'paid' | 'cancelled' | 'refunded';

export interface Enrollment {
  id: string;
  sessionId: string;
  workshopId: string;
  studentId: string;
  teacherId: string;
  status: EnrollmentStatus;
  createdAt: Date;
  paymentId?: string;
  calendarEventId?: string;
}

export interface EnrollmentCreateInput {
  sessionId: string;
  workshopId: string;
  studentId: string;
  teacherId: string;
}
