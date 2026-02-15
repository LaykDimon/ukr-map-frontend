export interface Person {
  id: string;
  name: string;
  slug?: string;
  wikiPageId?: number;
  summary?: string;
  birthYear?: number;
  birthDate?: string;
  birthPlace?: string;
  lat?: number;
  lng?: number;
  views: number;
  rating: number;
  imageUrl?: string;
  category?: string;
  isManual?: boolean;
}

export type UserRole = 'guest' | 'student' | 'teacher' | 'researcher' | 'admin';

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

export type ProposedEditStatus = 'pending' | 'approved' | 'rejected';

export interface ProposedEdit {
  id: string;
  personId: string;
  person?: Person;
  userId: number;
  user?: User;
  changes: Record<string, { old: any; new: any }>;
  comment?: string;
  status: ProposedEditStatus;
  reviewedBy?: number;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}
