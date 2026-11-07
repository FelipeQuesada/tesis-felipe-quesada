# MiTaller

Plataforma para **descubrir, publicar e inscribirse en talleres presenciales**.  
Proyecto de tesis de **Felipe Quesada**.

Incluye:

- **Web** — Next.js (App Router) + TypeScript + Firebase  
- **App mobile** — Expo / React Native (carpeta `mobile/`)

---

## Qué hace la app

| Rol | Puede |
| --- | --- |
| **Estudiante** | Explorar talleres, filtrar, guardar favoritos, inscribirse, ver perfil |
| **Profesor** | Crear y publicar talleres, sesiones y gestionar sus propuestas |
| **Visitante** | Ver talleres publicados y el blog (sin cuenta) |

Stack principal: **Next.js**, **Expo**, **Firebase Auth**, **Firestore**, deploy web en **Vercel**.

---

## Requisitos

- **Node.js** 20+ (recomendado 22 LTS)  
- **npm**  
- Proyecto propio en [Firebase](https://console.firebase.google.com/) (Auth + Firestore)

---

## Arranque rápido (web)

```bash
git clone https://github.com/FelipeQuesada/tesis-felipe-quesada.git
cd tesis-felipe-quesada
npm install
cp .env.example .env.local
```

1. Completá `.env.local` con la config de tu app web en Firebase (Project settings → Your apps).  
2. Desplegá reglas: `firebase deploy --only firestore:rules` (archivo `firestore.rules`).  
3. Corré la web:

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

---

## App mobile (`mobile/`)

```bash
cd mobile
npm install
cp .env.example .env
npx expo start
```

En `mobile/.env` usá las **mismas** credenciales de Firebase que en la web, con prefijo `EXPO_PUBLIC_` (ver plantilla).

- En celular: **Expo Go compatible con SDK 54** (la versión de la Play Store más nueva puede no coincidir).  
- `EXPO_PUBLIC_WEB_ORIGIN`: URL de la web (localhost, IP de tu PC en la misma red, o Vercel) para imágenes de `/public`.

---

## Variables de entorno (repo público)

| Archivo | Uso |
| --- | --- |
| `.env.example` | Plantilla web → copiar a `.env.local` |
| `mobile/.env.example` | Plantilla mobile → copiar a `mobile/.env` |

**No subas** `.env`, `.env.local` ni `mobile/.env` (están en `.gitignore`).

Las keys `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*` de Firebase **se exponen en el cliente** (es el diseño normal del SDK web). La seguridad real está en **Firestore Rules** y en no poner secretos de servidor con ese prefijo.

---

## Estructura

```text
/
├── src/                 # Web Next.js (páginas, services, tipos)
├── mobile/              # App Expo
├── public/              # Assets estáticos de la web
├── firestore.rules      # Reglas de seguridad
└── .env.example         # Plantilla de entorno (sin secretos)
```

---

## Deploy web (Vercel)

1. Conectá este repo a Vercel.  
2. Cargá las mismas variables que en `.env.example` (Environment Variables).  
3. En Firebase Auth → Authorized domains, agregá el dominio de Vercel.

---

## Seguridad (resumen)

- Reglas en `firestore.rules`: talleres publicados son de lectura pública; el resto según rol/dueño.  
- Nunca commits de archivos `.env*`.  
- Secretos de pasarela de pagos u otros servicios: variables **sin** `NEXT_PUBLIC_` / `EXPO_PUBLIC_`.

---

## Problemas frecuentes

| Síntoma | Qué revisar |
| --- | --- |
| Falta config de Firebase | `.env.local` / `mobile/.env` y reiniciar el servidor |
| Permission denied en Firestore | `firebase deploy --only firestore:rules` |
| Expo Go: “SDK incompatible” | Usar Expo Go para **SDK 54** o alinear el proyecto al SDK del teléfono |
| Imágenes rotas en el celular | `EXPO_PUBLIC_WEB_ORIGIN` apuntando a la web accesible desde el dispositivo |

---

## Autor

**Felipe Quesada** — trabajo de tesis académica.

Este repositorio es un MVP en desarrollo. No es una guía de producción completa (tests, CI y hardening siguen pendientes).
