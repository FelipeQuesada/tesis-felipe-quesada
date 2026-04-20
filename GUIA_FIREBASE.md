# 🔥 Guía Completa: Configurar Firebase para MiTaller

Esta guía te llevará paso a paso para crear y configurar tu proyecto Firebase.

---

## 📋 Paso 1: Crear cuenta y proyecto en Firebase

### 1.1. Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google
   - Si no tienes cuenta, créala en [accounts.google.com](https://accounts.google.com)

### 1.2. Crear un nuevo proyecto

1. Haz clic en **"Agregar proyecto"** o **"Create a project"**
2. **Nombre del proyecto**: Ingresa un nombre (ej: `mitaller-app` o `talleres-felipe`)
3. Haz clic en **"Continuar"**
4. **Google Analytics** (opcional):
   - Puedes habilitarlo o deshabilitarlo según prefieras
   - Para desarrollo, puedes deshabilitarlo
   - Haz clic en **"Continuar"** o **"Crear proyecto"**
5. Espera a que se cree el proyecto (30-60 segundos)
6. Haz clic en **"Continuar"** cuando esté listo

---

## 🔐 Paso 2: Configurar Firebase Authentication

### 2.1. Habilitar Email/Password

1. En el menú lateral, ve a **"Authentication"** (Autenticación)
2. Haz clic en **"Comenzar"** o **"Get started"**
3. Ve a la pestaña **"Sign-in method"** (Métodos de inicio de sesión)
4. Haz clic en **"Email/Password"**
5. Activa el primer toggle (Email/Password)
6. Haz clic en **"Guardar"**

### 2.2. Habilitar Google Sign-In (Opcional pero recomendado)

1. En la misma página de **"Sign-in method"**
2. Haz clic en **"Google"**
3. Activa el toggle
4. Selecciona un **Email de soporte** (tu email)
5. Haz clic en **"Guardar"**
6. Si aparece un mensaje sobre OAuth consent screen:
   - Haz clic en el enlace para configurarlo
   - O ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)
   - Completa la información básica y guarda

---

## 💾 Paso 3: Crear Firestore Database

### 3.1. Crear la base de datos

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"** o **"Create database"**
3. **Modo de seguridad**:
   - Para desarrollo: Selecciona **"Start in test mode"** (temporalmente)
   - ⚠️ **IMPORTANTE**: Después desplegaremos las reglas de seguridad reales
4. **Ubicación**:
   - Selecciona una ubicación cercana (ej: `southamerica-east1` para Argentina)
   - Haz clic en **"Habilitar"** o **"Enable"**
5. Espera a que se cree la base de datos (1-2 minutos)

---

## 🔑 Paso 4: Obtener las credenciales de la app web

### 4.1. Registrar la aplicación web

1. Ve a **"Project Settings"** (Configuración del proyecto)
   - Haz clic en el ícono de ⚙️ (engranaje) junto a "Project Overview"
   - O ve directamente a: [Project Settings](https://console.firebase.google.com/project/_/settings/general)
2. Desplázate hasta la sección **"Your apps"** (Tus apps)
3. Haz clic en el ícono **</>** (Web) para agregar una app web
4. **Registrar app**:
   - **Nickname**: Ingresa un nombre (ej: "MiTaller Web")
   - **Firebase Hosting**: Puedes dejarlo desmarcado por ahora
   - Haz clic en **"Registrar app"**

### 4.2. Copiar las credenciales

Verás un código JavaScript con las credenciales. Necesitas estos valores:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "tu-proyecto.firebaseapp.com",  // ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "tu-proyecto",            // ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "tu-proyecto.appspot.com",   // ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",      // ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123"      // ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

**Copia estos valores** porque los necesitarás para el archivo `.env.local`

---

## 📝 Paso 5: Actualizar el archivo .env.local

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores de ejemplo con tus credenciales reales:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (tu apiKey)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. **Guarda el archivo**

---

## 🛡️ Paso 6: Desplegar las reglas de seguridad de Firestore

### 6.1. Instalar Firebase CLI

Abre PowerShell o Terminal y ejecuta:

```bash
npm install -g firebase-tools
```

### 6.2. Iniciar sesión en Firebase

```bash
firebase login
```

- Se abrirá tu navegador
- Inicia sesión con la misma cuenta de Google que usaste en Firebase Console
- Autoriza el acceso

### 6.3. Inicializar Firebase en el proyecto

**OPCIÓN AUTOMÁTICA (RECOMENDADO):**
1. Haz doble clic en `configurar-firebase.bat` en la raíz del proyecto
2. El script te guiará automáticamente por todos los pasos

**OPCIÓN MANUAL:**
```bash
cd "d:\Archivos\Desktop\tesis-Felipe Quesada"
firebase init firestore
```

Cuando te pregunte:
- **"What file should be used for Firestore Rules?"**: Presiona Enter (usa `firestore.rules`)
- **"What file should be used for Firestore indexes?"**: Presiona Enter (usa `firestore.indexes.json` o déjalo vacío)

### 6.4. Seleccionar el proyecto

- Te mostrará una lista de proyectos
- Selecciona el proyecto que acabas de crear (usa las flechas y Enter)

### 6.5. Desplegar las reglas

```bash
firebase deploy --only firestore:rules
```

Deberías ver un mensaje de éxito: **"✔ Deployed Firestore Rules successfully"**

---

## ✅ Paso 7: Verificar que todo funciona

### 7.1. Reiniciar el servidor de desarrollo

1. Detén el servidor actual (si está corriendo) con `Ctrl+C`
2. Reinicia el servidor:

```bash
npm run dev
```

### 7.2. Probar la aplicación

1. Abre [http://localhost:3000](http://localhost:3000)
2. Ve a `/auth/register` para probar el registro
3. Si no hay errores en la consola, ¡todo está funcionando! 🎉

---

## 🆘 Solución de problemas

### Error: "Missing required environment variables"
- Verifica que `.env.local` existe y tiene todas las variables
- Asegúrate de que no hay espacios extra o comillas alrededor de los valores
- Reinicia el servidor después de cambiar `.env.local`

### Error: "Firebase: Error (auth/unauthorized-domain)"
- Ve a Firebase Console > Authentication > Settings
- En "Authorized domains", agrega `localhost`
- Si desplegaste en Vercel, agrega también tu dominio de Vercel

### Error al leer/escribir en Firestore
- Verifica que las reglas están desplegadas: `firebase deploy --only firestore:rules`
- Revisa la consola del navegador para ver el error específico
- Asegúrate de que Firestore está en modo "Production" (no test mode) después de desplegar las reglas

### Error: "Permission denied" en Firestore
- Las reglas de seguridad pueden estar bloqueando el acceso
- Verifica que desplegaste las reglas correctamente
- Revisa `firestore.rules` para entender los permisos

---

## 📚 Recursos adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## ✨ ¡Listo!

Una vez completados estos pasos, tu aplicación debería estar completamente funcional con Firebase. Puedes empezar a crear usuarios, talleres y sesiones.
