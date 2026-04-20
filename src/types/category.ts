export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  /** Emoji o icono opcional (UI) */
  icon?: string;
}
