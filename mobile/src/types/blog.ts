export type BlogPostStatus = 'draft' | 'published';

export interface BlogComment {
  id: string;
  blogId: string;
  userId: string;
  userDisplayName: string;
  text: string;
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  authorId: string;
  authorName?: string;
  status: BlogPostStatus;
  categoryIds: string[];
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}
