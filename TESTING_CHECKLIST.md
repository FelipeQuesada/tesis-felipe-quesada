# Checklist de Pruebas Manuales

## ✅ Configuración Inicial

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Firebase Auth habilitado (Email/Password + Google)
- [ ] Firestore Database creada
- [ ] Firestore Security Rules desplegadas
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run dev` inicia correctamente

## ✅ Autenticación

### Registro
- [ ] Registro con email/password como "Estudiante" funciona
- [ ] Registro con email/password como "Profesor" funciona
- [ ] Se crea documento en `users/{uid}` con el rol correcto
- [ ] Redirección a `/dashboard` después del registro

### Login
- [ ] Login con email/password funciona
- [ ] Login con Google funciona
- [ ] Si es primera vez con Google, se crea como "Estudiante"
- [ ] Redirección a `/dashboard` después del login

### Logout
- [ ] Botón "Salir" funciona
- [ ] Redirección a home después del logout

## ✅ Home (/)

- [ ] Muestra lista de talleres publicados
- [ ] Cards muestran título, precio, ubicación
- [ ] Link a detalle de taller funciona
- [ ] Si no hay talleres, muestra mensaje apropiado
- [ ] Navbar muestra opciones correctas según autenticación

## ✅ Dashboard (/dashboard)

### Como Estudiante
- [ ] Muestra "Talleres Disponibles"
- [ ] Muestra placeholder "Mis Inscripciones"
- [ ] Si no está logueado, redirige a `/auth/login`

### Como Profesor
- [ ] Muestra botón "Crear Nuevo Taller"
- [ ] Lista "Mis Talleres" (borradores y publicados)
- [ ] Muestra estado de cada taller (Publicado/Borrador)
- [ ] Links a ver/editar talleres funcionan

### Como Admin
- [ ] Muestra placeholder "Panel de Administración"

## ✅ Crear Taller (/teacher/workshops/new)

- [ ] Solo accesible para profesores
- [ ] Formulario completo funciona
- [ ] "Guardar como Borrador" crea workshop con `status: "draft"`
- [ ] "Crear y Publicar" crea workshop con `status: "published"` y `publishedAt`
- [ ] Redirección a detalle del taller después de crear
- [ ] Validación de campos requeridos funciona

## ✅ Crear Sesión (/teacher/workshops/[id]/sessions/new)

- [ ] Solo accesible para el profesor dueño del taller
- [ ] Muestra nombre del taller
- [ ] Formulario de fecha/hora funciona
- [ ] Crear sesión funciona
- [ ] Redirección a detalle del taller después de crear
- [ ] Validación de campos funciona

## ✅ Detalle de Taller (/workshops/[id])

- [ ] Muestra información completa del taller
- [ ] Muestra lista de sesiones disponibles
- [ ] Formato de fechas es legible
- [ ] Como estudiante, botón "Inscribirme" funciona
- [ ] Como profesor dueño, puede crear sesiones
- [ ] Inscripción crea enrollment con `status: "pending_payment"`
- [ ] Mensaje de éxito después de inscribirse

## ✅ Firestore Security Rules

### Users
- [ ] Usuario puede leer su propio documento
- [ ] Usuario puede actualizar solo campos seguros (displayName, photoURL, etc.)
- [ ] Usuario NO puede cambiar su `role`
- [ ] Admin puede cambiar `role` e `isActive`

### Workshops
- [ ] Talleres con `status: "published"` son visibles públicamente
- [ ] Talleres con `status: "draft"` solo visibles para el profesor dueño
- [ ] Profesor solo puede crear/editar sus propios talleres
- [ ] Admin puede hacer todo

### Sessions
- [ ] Sesiones de talleres publicados son visibles públicamente
- [ ] Profesor solo puede crear sesiones para sus talleres
- [ ] Admin puede hacer todo

### Enrollments
- [ ] Estudiante solo puede crear enrollments para sí mismo
- [ ] Estudiante solo puede leer sus propios enrollments
- [ ] Profesor puede leer enrollments de sus talleres
- [ ] Cliente NO puede cambiar `status` de enrollment

## ✅ UI/UX

- [ ] Loading states se muestran correctamente
- [ ] Error states se muestran correctamente
- [ ] Mensajes de error son claros
- [ ] Navegación es intuitiva
- [ ] Responsive en móvil (básico)

## ✅ Build y Lint

- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin errores (si configurado)
- [ ] No hay warnings de TypeScript

## 🔄 Flujos Completos

### Flujo Profesor Completo
1. [ ] Registrarse como profesor
2. [ ] Crear un taller (borrador)
3. [ ] Agregar una sesión
4. [ ] Publicar el taller
5. [ ] Ver el taller publicado en home

### Flujo Estudiante Completo
1. [ ] Registrarse como estudiante
2. [ ] Ver talleres en home
3. [ ] Ver detalle de un taller
4. [ ] Inscribirse en una sesión
5. [ ] Ver inscripción creada (en dashboard - cuando se implemente)

### Flujo Google Sign-In
1. [ ] Login con Google
2. [ ] Se crea usuario automáticamente como "Estudiante"
3. [ ] Puede navegar normalmente
4. [ ] Puede inscribirse en talleres

---

**Nota**: Marca cada ítem después de probarlo. Si encuentras errores, documenta el problema y el paso para reproducirlo.
