'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { listAllBlogPosts, deleteBlogPost, publishBlogPost, unpublishBlogPost } from '@/services/blog.service';
import { AdminNav } from '@/components/AdminNav';
import { HomeHeader } from '@/components/HomeHeader';
import type { BlogPost } from '@/types';

export default function AdminBlogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadBlogs() {
      try {
        setLoading(true);
        const data = await listAllBlogPosts();
        setBlogs(data);
      } catch (err) {
        console.error('Error loading blogs:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'admin') {
      loadBlogs();
    }
  }, [user]);

  const handleDelete = async (blogId: string) => {
    if (!confirm('¿Estás seguro de eliminar este blog?')) return;
    try {
      await deleteBlogPost(blogId);
      setBlogs(blogs.filter((b) => b.id !== blogId));
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Error al eliminar el blog');
    }
  };

  const handleTogglePublish = async (blog: BlogPost) => {
    try {
      if (blog.status === 'published') {
        await unpublishBlogPost(blog.id);
      } else {
        await publishBlogPost(blog.id);
      }
      setBlogs(blogs.map((b) => (b.id === blog.id ? { ...b, status: b.status === 'published' ? 'draft' : 'published' } : b)));
    } catch (err) {
      console.error('Error toggling publish:', err);
      alert('Error al cambiar el estado del blog');
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <HomeHeader />
        <AdminNav />
        <main style={{ padding: '1.5rem' }}>
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <HomeHeader />
      <AdminNav />
      <main style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Gestionar Blogs</h1>
          <Link href="/admin/blogs/new" className="btn btn-primary">
            Crear Blog
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className="material-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No hay blogs aún.</p>
            <Link href="/admin/blogs/new" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Crear primer blog
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {blogs.map((blog) => (
              <div key={blog.id} className="material-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{blog.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {blog.excerpt || blog.content.substring(0, 100)}...
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>Categorías: {blog.categoryIds.length}</span>
                      <span>•</span>
                      <span>{blog.createdAt.toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: blog.status === 'published' ? 'var(--primary-green-light)' : '#fff3cd',
                        color: blog.status === 'published' ? 'var(--primary-green-dark)' : '#856404',
                      }}
                    >
                      {blog.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <Link href={`/admin/blogs/${blog.id}/edit`} className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    Editar
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(blog)}
                    className={blog.status === 'published' ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {blog.status === 'published' ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', background: '#dc3545', color: 'white' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
