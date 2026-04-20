import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import { optimizeImageIfNeeded } from '@/utils/image-compression';

/**
 * Sube una imagen a Firebase Storage y retorna la URL de descarga
 * 
 * IMPORTANTE: La imagen se comprime automáticamente antes de subirla para:
 * - Reducir costos de almacenamiento (hasta 90% de reducción)
 * - Mejorar velocidad de carga
 * - Reducir consumo de datos
 * 
 * La imagen se redimensiona a máximo 800x800px y se comprime a calidad 80%
 */
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage no está inicializado');
  }

  // Verificar que el usuario esté autenticado
  if (!auth?.currentUser) {
    throw new Error('Debes estar autenticado para subir imágenes');
  }

  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño original (máximo 10MB antes de comprimir)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('La imagen no puede ser mayor a 10MB');
  }

  // Optimizar imagen antes de subir (comprime si es mayor a 1MB)
  console.log('🔄 Optimizando imagen antes de subir...');
  const optimizedFile = await optimizeImageIfNeeded(file, 1); // Comprimir si es mayor a 1MB

  // Crear referencia única para la imagen de perfil
  const timestamp = Date.now();
  const fileName = `profile_${userId}_${timestamp}.jpg`; // Siempre usar .jpg después de comprimir
  const storageRef = ref(storage, `profile-images/${fileName}`);

  try {
    console.log('📤 Subiendo imagen optimizada a Firebase Storage...', {
      fileName,
      originalSize: `${(file.size / 1024).toFixed(2)}KB`,
      optimizedSize: `${(optimizedFile.size / 1024).toFixed(2)}KB`,
      savings: `${(((file.size - optimizedFile.size) / file.size) * 100).toFixed(1)}%`,
    });

    // Subir el archivo optimizado
    await uploadBytes(storageRef, optimizedFile);
    console.log('✅ Imagen subida exitosamente');
    
    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ URL de descarga obtenida:', downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error('❌ Error subiendo imagen:', error);
    
    // Mensajes de error más específicos
    if (error.code === 'storage/unauthorized') {
      throw new Error('No tienes permisos para subir imágenes. Verifica que estés autenticado.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('La subida fue cancelada.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Error desconocido al subir la imagen. Verifica tu conexión a internet.');
    } else if (error.message?.includes('CORS') || error.code === 'storage/unauthorized') {
      throw new Error(
        'Error de configuración. Por favor, configura las Security Rules de Firebase Storage. ' +
        'Consulta FIREBASE-STORAGE-SETUP.md para instrucciones (es gratis y toma 5 minutos).'
      );
    }
    
    throw new Error(error.message || 'Error al subir la imagen. Por favor, intenta de nuevo.');
  }
}
