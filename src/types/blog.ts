export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  authorId: string;
  /** Nombre para mostrar en el blog público (evita leer `users` sin autenticación). */
  authorName?: string;
  status: BlogPostStatus;
  categoryIds: string[];
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

export interface BlogPostCreateInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  authorName?: string;
  categoryIds: string[];
  status?: BlogPostStatus;
}

export interface BlogLike {
  id: string;
  blogId: string;
  userId: string;
  createdAt: Date;
}

export interface BlogComment {
  id: string;
  blogId: string;
  userId: string;
  userDisplayName: string;
  text: string;
  createdAt: Date;
}
