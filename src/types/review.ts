export interface Review {
  id: string;
  workshopId: string;
  studentId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  enrollmentId?: string;
}
