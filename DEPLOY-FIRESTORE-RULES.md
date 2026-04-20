# Cómo desplegar las reglas de Firestore

## ⚠️ IMPORTANTE
Las reglas de Firestore que tienes actualmente tienen una fecha de expiración que está bloqueando el acceso. Necesitas desplegar las nuevas reglas para que la aplicación funcione.

## Opción 1: Desde la consola de Firebase (Más fácil - Recomendado)

1. **Ve a la consola de Firebase:**
   - Abre https://console.firebase.google.com/
   - Selecciona tu proyecto: `mitaller-app`

2. **Ve a Firestore Database:**
   - En el menú lateral, haz clic en **"Firestore Database"**
   - Haz clic en la pestaña **"Rules"** (arriba)

3. **Copia las nuevas reglas:**
   - Abre el archivo `firestore.rules` en tu editor
   - Copia TODO el contenido

4. **Pega las reglas:**
   - Pega el contenido en el editor de reglas de Firebase Console
   - Haz clic en **"Publicar"** (botón azul arriba)

5. **Verifica:**
   - Deberías ver un mensaje de éxito: "Rules published successfully"
   - Recarga tu aplicación y el error debería desaparecer

## Opción 2: Usando Firebase CLI (Si lo tienes instalado)

Si tienes Firebase CLI instalado, puedes desplegar las reglas desde la terminal:

```bash
firebase deploy --only firestore:rules
```

## ¿Qué hacen estas reglas?

Las nuevas reglas permiten:

✅ **Usuarios autenticados pueden:**
- Leer y actualizar su propio perfil
- Crear su documento de usuario al registrarse
- Ver talleres publicados
- Crear inscripciones para ellos mismos

✅ **Profesores pueden:**
- Crear y gestionar sus propios talleres
- Ver inscripciones de sus talleres
- Crear sesiones para sus talleres

✅ **Administradores pueden:**
- Acceder a todo
- Cambiar roles de usuarios
- Gestionar blog posts
- Crear/editar categorías, países y ciudades

❌ **Protecciones de seguridad:**
- Los usuarios NO pueden cambiar su propio `role` o `isActive`
- Los usuarios NO pueden cambiar `teacherId` de talleres
- Los clientes NO pueden cambiar el `status` de pagos
- Solo se pueden leer talleres publicados públicamente

## Si aún tienes problemas:

1. Verifica que estés autenticado en la aplicación
2. Revisa la consola del navegador para ver el error específico
3. Asegúrate de que las reglas se publicaron correctamente
4. Espera unos segundos después de publicar (puede tomar unos momentos en propagarse)
