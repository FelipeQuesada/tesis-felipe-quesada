# Reglas de Firestore (app móvil + web)

## Importante: hosting ≠ reglas de Firestore

- **Vercel / hosting**: en Firebase Console → **Authentication** → **Dominios autorizados** agregás tu URL (para login con Google/email).
- **Firestore**: las reglas están en `firestore.rules` en la raíz del repo. La app móvil y la web usan las **mismas claves** (`EXPO_PUBLIC_*` / `NEXT_PUBLIC_*`) y el **mismo proyecto** (`mitaller-app`).

El hosting **no** “pide permiso” a Firestore como un dominio extra: Firestore valida cada lectura/escritura con `firestore.rules`.

## Si en la consola de Firebase pegaste reglas a mano

Compará con el archivo **`firestore.rules` del repositorio**. En la versión que pegaste **faltan** (y la app los necesita):

1. Función **`isPublicBlogId`** (posts `demo-*`, `blog-beneficio-*` y blogs publicados).
2. Colección **`blogLikes`** (me gusta en el blog).
3. Colección **`blogComments`** (comentarios).
4. **Favoritos**: en el repo `delete` usa `resource.data.userId`; no mezclar `create/update/delete` con solo `request.resource` (en **delete** `request.resource` no existe).

Las reglas de **`workshops`** (talleres publicados) en tu pegado **sí coinciden** con el repo: lectura pública si `status == 'published'`. Eso **no explica** el error *"could not reach cloud firestore backend"* (ese es **red/timeout**, no permisos).

Si el error fuera de reglas verías **`permission-denied`**, no timeout de 10 segundos.

## Publicar las reglas correctas (una sola vez)

En la raíz del proyecto (donde está `firestore.rules`):

```bash
firebase login
firebase use mitaller-app
firebase deploy --only firestore:rules
```

O en [Firebase Console](https://console.firebase.google.com/) → Firestore → **Reglas** → copiar todo el contenido de `firestore.rules` del repo → **Publicar**.

## Checklist app móvil

1. Archivo **`mobile/.env`** (no solo `.env.example`) con `EXPO_PUBLIC_FIREBASE_*` iguales a `.env.local` de la web.
2. Reiniciar: `npx expo start --clear` y cerrar Expo Go por completo.
3. En el celular, probar con **datos móviles** si la Wi‑Fi falla.
4. `EXPO_PUBLIC_WEB_ORIGIN`: en el celular usar IP de la PC (`http://192.168.x.x:3000`) o URL de Vercel, **no** `localhost`.

## Error en el celular: "Could not reach Cloud Firestore backend (10 seconds)"

Eso **no son las reglas**. Es el SDK de Firestore en **Expo Go** que no abre el canal a Google a tiempo.

Qué hicimos en el código:

- Long polling forzado en iOS/Android.
- Calentamiento de conexión al abrir la app (`warmUpFirestoreConnection`).
- Reintentos largos en los hooks.
- Firebase en `mobile` fijado a **10.14.1** (misma línea que la web; la 12.x suele dar más problemas en RN).

Pasos en el celular:

1. Cerrá **Expo Go** (forzar cierre), no solo minimizar.
2. En `mobile`: `npm install` y `npx expo start --clear`.
3. Volvé a escanear el QR.
4. Si sigue: probá **solo datos móviles** (Wi‑Fi apagada) o al revés.
5. Revisá que la hora del celular sea automática (fecha incorrecta rompe HTTPS).

## Cómo saber qué falla

| Mensaje / código | Causa |
|------------------|--------|
| `could not reach` / `unavailable` | Red del celular hacia Google |
| `permission-denied` | Reglas no publicadas o query no permitida |
| `failed-precondition` + link índice | Crear índice en Firestore (consola) |

La app móvil ahora muestra el **código** del error en el mensaje cuando falla la carga de talleres.
