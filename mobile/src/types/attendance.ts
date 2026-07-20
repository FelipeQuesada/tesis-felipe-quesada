export interface Attendance {
  id: string;
  sessionId: string;
  enrollmentId: string;
  studentId: string;
  workshopId: string;
  present: boolean;
  markedAt: Date;
  markedBy: string;
}
