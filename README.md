# MiTaller - Plataforma de Talleres Presenciales

Plataforma web para encontrar y crear talleres presenciales en Argentina. Desarrollada con Next.js, TypeScript y Firebase.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Autenticación**: Firebase Auth (email/password + Google)
- **Base de Datos**: Firestore
- **Hosting**: Vercel (recomendado)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase
- Git

## 🛠️ Configuración Local

### 1. Clonar el repositorio

```bash
git clone <tu-repo-url>
cd tesis-Felipe-Quesada
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

#### 3.1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID**

#### 3.2. Habilitar servicios necesarios

**Firebase Authentication:**
1. Ve a **Authentication** > **Sign-in method**
2. Habilita:
   - **Email/Password**
   - **Google** (configura el email de soporte y dominio autorizado)

**Firestore Database:**
1. Ve a **Firestore Database**
2. Crea la base de datos en modo **Production** (o **Test** para desarrollo)
3. Selecciona una ubicación (ej: `southamerica-east1` para Argentina)

#### 3.3. Obtener credenciales

1. Ve a **Project Settings** (⚙️) > **General**
2. En "Your apps", haz clic en el ícono web (</>)
3. Registra la app con un nombre (ej: "MiTaller Web")
4. Copia las credenciales que se muestran

### 4. Configurar variables de entorno

1. En la raíz del proyecto, copiá la plantilla:

```bash
cp .env.example .env.local
```

2. Editá `.env.local` con las credenciales de Firebase (Project Settings → Your apps):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

`.env.local` es el nombre correcto para Next.js; no lo subas a Git. En Vercel cargá las mismas keys (tipo Config).

### 5. Desplegar Firestore Security Rules

1. Instala Firebase CLI si no lo tienes:
```bash
npm install -g firebase-tools
```

2. Inicia sesión:
```bash
firebase login
```

3. Inicializa Firebase en el proyecto (si es necesario):
```bash
firebase init firestore
```
- Selecciona tu proyecto
- Usa `firestore.rules` como archivo de reglas

4. Despliega las reglas:
```bash
firebase deploy --only firestore:rules
```

**Importante**: Las reglas de seguridad están en `firestore.rules`. Asegúrate de desplegarlas antes de usar la app en producción.

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🧪 Probar el Flujo Completo

### Flujo para Profesor (Teacher)

1. **Registrarse como Profesor:**
   - Ve a `/auth/register`
   - Completa email y contraseña
   - Selecciona "Profesor" como tipo de cuenta
   - Haz clic en "Registrarse"

2. **Crear un Taller:**
   - Ve a `/dashboard` (deberías ver "Crear Nuevo Taller")
   - Haz clic en "Crear Nuevo Taller" o ve a `/teacher/workshops/new`
   - Completa el formulario:
     - Título: "Taller de Cocina Italiana"
     - Descripción: "Aprende a hacer pasta fresca..."
     - Categoría: "Cocina" (texto libre por ahora)
     - Precio: 5000
     - Capacidad: 10
     - Dirección: "Av. Corrientes 1234, CABA"
     - Ciudad: "Buenos Aires"
   - Haz clic en "Crear y Publicar" (o "Guardar como Borrador")

3. **Agregar una Sesión:**
   - En el detalle del taller, haz clic en "Agregar Sesión"
   - O ve a `/teacher/workshops/[id]/sessions/new`
   - Selecciona fecha y hora de inicio y fin
   - Haz clic en "Crear Sesión"

### Flujo para Estudiante (Student)

1. **Registrarse como Estudiante:**
   - Ve a `/auth/register`
   - Completa email y contraseña
   - Selecciona "Estudiante" como tipo de cuenta
   - Haz clic en "Registrarse"

2. **Explorar Talleres:**
   - En la home (`/`) verás todos los talleres publicados
   - Haz clic en un taller para ver detalles

3. **Inscribirse en un Taller:**
   - En el detalle del taller (`/workshops/[id]`)
   - Verás las sesiones disponibles
   - Haz clic en "Inscribirme" en una sesión
   - Se creará una inscripción con estado "pending_payment"

### Flujo de Autenticación con Google

1. Ve a `/auth/login`
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Si es la primera vez, se creará automáticamente como "Estudiante"
5. Serás redirigido al dashboard

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Rutas de Next.js (App Router)
│   ├── auth/              # Autenticación
│   ├── dashboard/          # Dashboard por roles
│   ├── teacher/            # Rutas de profesor
│   ├── workshops/          # Detalle de talleres
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Home
│   └── globals.css         # Estilos globales
├── components/             # Componentes reutilizables
├── contexts/               # Context providers (Auth)
├── hooks/                  # Custom hooks
├── lib/                    # Configuración (Firebase, env)
├── services/               # Capa de datos (Firestore)
├── types/                  # Tipos TypeScript
└── scripts/                # Scripts utilitarios (seed)
```

## 🔒 Seguridad

### Firestore Security Rules

Las reglas están en `firestore.rules` y garantizan:

- **Users**: Solo pueden actualizar sus propios campos de perfil (no `role` ni `isActive`)
- **Workshops**: Lectura pública solo si `status == "published"`. Profesores solo pueden editar los suyos
- **Sessions**: Lectura pública solo si el workshop padre está publicado
- **Enrollments**: Estudiantes solo pueden crear/leer los suyos. Profesores ven los de sus talleres
- **Payments**: Solo admin puede crear/actualizar (el cliente nunca puede cambiar `status`)
- **Reviews**: Lectura pública si el workshop está publicado
- **Favorites**: Usuarios solo gestionan los suyos
- **BlogPosts**: Lectura pública solo si `status == "published"`. Solo admin puede escribir

### Variables de Entorno

- **NUNCA** commitees `.env.local` (está en `.gitignore`)
- Las variables `NEXT_PUBLIC_*` son públicas (se exponen al cliente)
- Para secretos del servidor (futuro: Mercado Pago, Google Calendar), usa variables sin `NEXT_PUBLIC_`

## 🏗️ Build y Deploy

### Build local

```bash
npm run build
```

### Deploy a Vercel

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno en Vercel Project Settings
3. Vercel detectará Next.js automáticamente
4. Despliega

### Configurar dominios autorizados en Firebase

Después del deploy:
1. Ve a Firebase Console > Authentication > Settings
2. Agrega tu dominio de Vercel a "Authorized domains"
3. Para Google Sign-In, agrega el dominio en la consola de Google Cloud

## 🐛 Troubleshooting

### Error: "Missing required environment variables"

- Verifica que `.env.local` existe y tiene todas las variables
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error de autenticación con Google

- Verifica que Google Sign-In está habilitado en Firebase
- Asegúrate de que el dominio está en "Authorized domains"
- Verifica que el OAuth consent screen está configurado en Google Cloud Console

### Error al leer/escribir en Firestore

- Verifica que las Security Rules están desplegadas: `firebase deploy --only firestore:rules`
- Revisa la consola del navegador para ver el error específico
- Verifica que el usuario tiene los permisos correctos según su rol

### Build falla

```bash
npm run lint  # Verifica errores de linting
npm run build # Revisa errores de TypeScript
```

## 📝 Próximas Mejoras

- [ ] Integración con Mercado Pago para pagos
- [ ] Integración con Google Calendar para agregar eventos
- [ ] Integración con Google Maps para ubicaciones
- [ ] Sistema de reviews completo
- [ ] Panel de administración
- [ ] Notificaciones por email
- [ ] Búsqueda y filtros avanzados

## 📄 Licencia

Este proyecto es parte de una tesis académica.

## 👤 Autor

Felipe Quesada

---

**Nota**: Este es un MVP funcional. Para producción, considera:
- Implementar tests automatizados
- Configurar CI/CD
- Monitoreo y logging
- Optimización de imágenes
- SEO mejorado
#   t e s i s - f e l i p e - q u e s a d a 
 
 