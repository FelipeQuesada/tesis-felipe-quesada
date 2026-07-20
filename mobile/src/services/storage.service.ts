import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, storage } from '../lib/firebase';

/**
 * Sube una imagen local (URI file:// o content://) al bucket `profile-images/`.
 */
export async function uploadProfileImageFromUri(
  userId: string,
  localUri: string,
  mimeType = 'image/jpeg'
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage no está inicializado');
  if (!auth?.currentUser) {
    throw new Error('Debés estar autenticado para subir imágenes');
  }

  const response = await fetch(localUri);
  const blob = await response.blob();

  const timestamp = Date.now();
  const fileName = `profile_${userId}_${timestamp}.jpg`;
  const storageRef = ref(storage, `profile-images/${fileName}`);

  await uploadBytes(storageRef, blob, { contentType: mimeType });
  return getDownloadURL(storageRef);
}
