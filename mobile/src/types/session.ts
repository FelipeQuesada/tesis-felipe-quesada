export type SessionStatus = 'scheduled' | 'full' | 'cancelled';

export interface SessionStats {
  enrolledCount: number;
}

export interface Session {
  id: string;
  workshopId: string;
  startAt: Date;
  endAt: Date;
  status: SessionStatus;
  capacityOverride?: number;
  stats: SessionStats;
}

export interface SessionCreateInput {
  workshopId: string;
  startAt: Date;
  endAt: Date;
  capacityOverride?: number;
}
