# ✅ Checklist de Configuración Firebase

Marca cada paso conforme lo completes:

## 🔥 Configuración Inicial
- [ ] Crear cuenta en Firebase Console
- [ ] Crear nuevo proyecto Firebase
- [ ] Anotar el Project ID: `_________________`

## 🔐 Authentication
- [ ] Habilitar Email/Password en Authentication
- [ ] Habilitar Google Sign-In (opcional)
- [ ] Configurar email de soporte para Google

## 💾 Firestore Database
- [ ] Crear base de datos Firestore
- [ ] Seleccionar ubicación (ej: southamerica-east1)
- [ ] Iniciar en modo Test (temporalmente)

## 🔑 Credenciales
- [ ] Ir a Project Settings > General
- [ ] Registrar app web (ícono </>)
- [ ] Copiar `apiKey`: `_________________`
- [ ] Copiar `authDomain`: `_________________`
- [ ] Copiar `projectId`: `_________________`
- [ ] Copiar `storageBucket`: `_________________`
- [ ] Copiar `messagingSenderId`: `_________________`
- [ ] Copiar `appId`: `_________________`

## 📝 Variables de Entorno
- [ ] Abrir archivo `.env.local`
- [ ] Reemplazar `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] Reemplazar `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] Reemplazar `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] Reemplazar `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] Reemplazar `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] Reemplazar `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Guardar el archivo

## 🛡️ Reglas de Seguridad
- [ ] Instalar Firebase CLI: `npm install -g firebase-tools`
- [ ] Iniciar sesión: `firebase login`
- [ ] Inicializar Firestore: `firebase init firestore`
- [ ] Seleccionar el proyecto correcto
- [ ] Desplegar reglas: `firebase deploy --only firestore:rules`
- [ ] Verificar mensaje de éxito

## ✅ Verificación
- [ ] Reiniciar servidor: `npm run dev`
- [ ] Abrir http://localhost:3000
- [ ] Probar registro en `/auth/register`
- [ ] Verificar que no hay errores en consola

---

## 📝 Notas

**Project ID**: _________________________________

**Fecha de configuración**: ___________________

**Problemas encontrados**: 
_________________________________________________
_________________________________________________
