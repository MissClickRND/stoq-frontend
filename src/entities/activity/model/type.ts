export type ActivityAction = 'create' | 'update' | 'delete' | 'role' | 'invite' | 'automatic';
export interface ActivityEntry {
  id: string;
  action: ActivityAction;
  author: { id?: number | null; name: string; role: string };
  category: string;
  title: string;
  description: string;
  timestamp: string;
  change?: { before: string; after: string };
  object?: string | null;
  detail?: string | null;
}
export interface ActivityPage { items: ActivityEntry[]; nextCursor: string | null }
