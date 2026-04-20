export type PaymentStatus = 'created' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
export type PaymentProvider = 'mercadopago';

export interface Payment {
  id: string;
  enrollmentId: string;
  studentId: string;
  teacherId: string;
  workshopId: string;
  sessionId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}
