'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfileFields } from '@/services/user.service';
import { uploadProfileImage } from '@/services/storage.service';
import { HomeHeader } from '@/components/HomeHeader';
import { BottomNav } from '@/components/BottomNav';
import { CountryCitySelect } from '@/components/CountryCitySelect';
import { CategorySelect } from '@/components/CategorySelect';
import type { UserProfileUpdate } from '@/types';
import { calculateAge } from '@/types/user';

export default function TeacherProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<UserProfileUpdate>({
    displayName: '',
    photoURL: '',
    countryId: '',
    cityId: '',
    age: undefined,
    phoneNumber: '',
    interests: [],
    bio: '',
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/');
    } else if (user) {
      setFormData({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        countryId: user.countryId || '',
        cityId: user.cityId || '',
        birthDate: user.birthDate || '',
        phoneNumber: user.phoneNumber || '',
        interests: user.interests || [],
        bio: user.bio || '',
      });
    }
  }, [user, authLoading, router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (máximo 10MB antes de comprimir - se comprimirá automáticamente)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('La imagen no puede ser mayor a 10MB');
      return;
    }

    setSelectedImageFile(file);
    setError(null);

    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(false);
    setSaving(true);
    setUploadingImage(true);

    try {
      let finalPhotoURL = formData.photoURL;

      // Si hay una imagen seleccionada, intentar subirla
      if (selectedImageFile) {
        try {
          console.log('📤 Iniciando subida de imagen...');
          finalPhotoURL = await uploadProfileImage(user.uid, selectedImageFile);
          console.log('✅ Imagen subida, URL:', finalPhotoURL);
        } catch (uploadError: any) {
          console.error('❌ Error en subida de imagen:', uploadError);
          // Si falla la subida pero hay una URL anterior, continuar con esa
          if (!finalPhotoURL) {
            setError(uploadError.message || 'Error al subir la imagen. Verifica que estés autenticado y que la imagen sea válida.');
            setSaving(false);
            setUploadingImage(false);
            return;
          } else {
            // Si hay una URL anterior, mostrar advertencia pero continuar
            console.warn('⚠️ No se pudo subir la nueva imagen, usando la anterior');
            setError('No se pudo actualizar la foto de perfil, pero se guardarán los demás cambios.');
          }
        }
      }

      // Actualizar el perfil (con o sin nueva foto)
      await updateProfileFields(user.uid, {
        ...formData,
        photoURL: finalPhotoURL,
      });

      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error actualizando perfil:', err);
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };


  if (authLoading) {
    return (
      <>
        <HomeHeader />
        <main style={{ paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '80px' }}>
          <div className="loading">Cargando...</div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <>
      <HomeHeader />
      <main style={{ paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '200px', maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="section-title" style={{ marginBottom: '2rem' }}>
          Editar Perfil
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Foto de perfil */}
          <div className="form-group" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 1rem',
                background: '#f5f5f5',
                cursor: 'pointer',
                border: '2px solid var(--primary-green)',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview || formData.photoURL ? (
                <Image
                  src={imagePreview || formData.photoURL || ''}
                  alt="Foto de perfil"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--primary-green-light)',
                    color: 'var(--primary-green-dark)',
                    fontSize: '2rem',
                    fontWeight: 600,
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ marginBottom: '0.25rem' }}
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Toca para elegir</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Subiendo...' : selectedImageFile ? 'Cambiar foto' : 'Elegir foto de perfil'}
            </button>
            {selectedImageFile && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {selectedImageFile.name}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="displayName" className="form-label">
              Nombre completo *
            </label>
            <input
              id="displayName"
              type="text"
              className="form-input"
              value={formData.displayName || ''}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Tu nombre"
              required
            />
          </div>

          {/* Email (solo lectura) */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={user.email}
              disabled
              style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              El email no se puede cambiar
            </small>
          </div>

          {/* Fecha de nacimiento */}
          <div className="form-group">
            <label htmlFor="birthDate" className="form-label">
              Fecha de nacimiento
            </label>
            <input
              id="birthDate"
              type="date"
              className="form-input"
              value={formData.birthDate || ''}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
            />
            {formData.birthDate && (
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
                Edad: {calculateAge(formData.birthDate)} años
              </small>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Número de teléfono
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className="form-input"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          {/* Ubicación */}
          <CountryCitySelect
            selectedCountryId={formData.countryId}
            selectedCityId={formData.cityId}
            onCountryChange={(countryId, countryName) => {
              console.log('onCountryChange llamado:', countryId, countryName);
              setFormData((prev) => ({ ...prev, countryId, cityId: '' }));
            }}
            onCityChange={(cityId, cityName) => {
              console.log('onCityChange llamado:', cityId, cityName);
              setFormData((prev) => ({ ...prev, cityId }));
            }}
          />

          {/* Intereses (Categorías) */}
          <div style={{ position: 'relative' }}>
            <CategorySelect
              selectedCategoryIds={formData.interests || []}
              onCategoriesChange={(categoryIds) => {
                setFormData((prev) => ({ ...prev, interests: categoryIds }));
              }}
            />
          </div>

          {/* Biografía */}
          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              Biografía
            </label>
            <textarea
              id="bio"
              className="form-textarea"
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Cuéntanos sobre ti..."
              rows={4}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div style={{ padding: '1rem', background: '#efe', color: '#060', borderRadius: '8px', marginBottom: '1rem' }}>
              Perfil actualizado correctamente
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '2rem',
            marginBottom: '3rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--divider)',
          }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
              disabled={saving}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
              style={{ 
                flex: 2,
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </main>
      <BottomNav />
    </>
  );
}
