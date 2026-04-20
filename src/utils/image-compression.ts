/**
 * Utilidades para comprimir y optimizar imágenes antes de subirlas
 * Esto reduce significativamente el tamaño del archivo y los costos de almacenamiento
 */

/**
 * Comprime una imagen reduciendo su tamaño y calidad
 * @param file Archivo de imagen original
 * @param maxWidth Ancho máximo en píxeles (default: 800)
 * @param maxHeight Alto máximo en píxeles (default: 800)
 * @param quality Calidad de compresión 0-1 (default: 0.8)
 * @returns Promise con el archivo comprimido
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Crear canvas para redimensionar y comprimir
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'));
              return;
            }
            
            // Crear nuevo archivo con el nombre original pero comprimido
            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: 'image/jpeg', // Siempre usar JPEG para mejor compresión
                lastModified: Date.now(),
              }
            );
            
            console.log(`📦 Imagen comprimida: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reducción)`);
            
            resolve(compressedFile);
          },
          'image/jpeg', // Siempre usar JPEG para mejor compresión
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Valida y comprime una imagen si es necesario
 * @param file Archivo de imagen
 * @param maxSizeMB Tamaño máximo en MB antes de comprimir (default: 1MB)
 * @returns Promise con el archivo (comprimido si era necesario)
 */
export async function optimizeImageIfNeeded(
  file: File,
  maxSizeMB: number = 1
): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Si la imagen ya es pequeña, no comprimir
  if (file.size <= maxSizeBytes) {
    console.log(`✅ Imagen ya optimizada: ${(file.size / 1024).toFixed(2)}KB`);
    return file;
  }
  
  // Comprimir la imagen
  return compressImage(file);
}
