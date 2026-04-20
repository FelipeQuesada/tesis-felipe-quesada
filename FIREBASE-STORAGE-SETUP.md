# Configuración de Firebase Storage (GRATIS - Sin costo adicional)

## ⚠️ IMPORTANTE
**NO necesitas crear ninguna cuenta nueva ni pagar nada adicional.** Firebase Storage ya está incluido en tu proyecto de Firebase.

El problema de CORS se resuelve configurando las **Security Rules** de Firebase Storage desde la consola de Firebase, que es completamente **GRATIS**.

## Pasos para configurar (5 minutos):

1. **Ve a la consola de Firebase:**
   - Abre https://console.firebase.google.com/
   - Selecciona tu proyecto: `mitaller-app`

2. **Ve a Storage:**
   - En el menú lateral, haz clic en **"Storage"**
   - Si es la primera vez, haz clic en **"Empezar"** para habilitar Storage (gratis)

3. **Configura las Security Rules:**
   - Haz clic en la pestaña **"Rules"** (arriba)
   - Reemplaza todo el contenido con estas reglas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública de imágenes de perfil
    match /profile-images/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Para otros archivos, mantener reglas restrictivas
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **Publica las reglas:**
   - Haz clic en **"Publicar"** (botón azul arriba)

5. **¡Listo!** 
   - Ahora deberías poder subir imágenes sin problemas de CORS

## ¿Por qué funciona esto?

Las Security Rules de Firebase Storage controlan quién puede leer y escribir archivos. Al configurarlas correctamente, Firebase permite las solicitudes desde tu aplicación sin problemas de CORS.

**No necesitas:**
- ❌ Crear cuenta de Google Cloud Platform
- ❌ Configurar CORS con `gsutil`
- ❌ Pagar nada adicional
- ❌ Instalar herramientas adicionales

**Solo necesitas:**
- ✅ Acceder a la consola de Firebase (que ya tienes)
- ✅ Copiar y pegar las reglas
- ✅ Hacer clic en "Publicar"

## Si aún tienes problemas:

1. Verifica que estés autenticado en la aplicación
2. Revisa la consola del navegador para ver el error específico
3. Asegúrate de que las reglas se publicaron correctamente (deberías ver "Rules published successfully")

## Costos:

Firebase Storage tiene un plan gratuito generoso:
- **5 GB de almacenamiento gratis**
- **1 GB de descarga por día gratis**
- Para una aplicación pequeña/mediana, esto es más que suficiente

Solo pagarías si superas estos límites, lo cual es muy poco probable para fotos de perfil.
