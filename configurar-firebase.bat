@echo off
chcp 65001 >nul
title Configuración Automática de Firebase - MiTaller
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     CONFIGURACIÓN AUTOMÁTICA DE FIREBASE PARA MITALLER      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Cambiar a la unidad D:
D:

REM Cambiar al directorio del proyecto
cd "D:\Archivos\Desktop\tesis-Felipe Quesada" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se pudo acceder al directorio del proyecto.
    echo Verifica que la ruta sea correcta.
    pause
    exit /b 1
)

echo [✓] Directorio del proyecto: %CD%
echo.

REM Verificar Node.js
echo [1/6] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] Node.js no está instalado o no está en el PATH.
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
node --version >nul 2>&1
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js encontrado: %NODE_VERSION%
echo.

REM Verificar npm
echo [2/6] Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] npm no está disponible.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [✓] npm encontrado: %NPM_VERSION%
echo.

REM Verificar/Instalar Firebase CLI
echo [3/6] Verificando Firebase CLI...
where firebase >nul 2>&1
if %errorlevel% neq 0 (
    echo [⚠] Firebase CLI no está instalado.
    echo.
    set /p instalar="¿Deseas instalarlo ahora? (S/N): "
    if /i "%instalar%"=="S" (
        echo.
        echo [→] Instalando Firebase CLI...
        call npm install -g firebase-tools
        if %errorlevel% neq 0 (
            echo [✗] Error al instalar Firebase CLI.
            pause
            exit /b 1
        )
        echo [✓] Firebase CLI instalado correctamente.
        echo.
        echo [⚠] IMPORTANTE: Cierra y vuelve a abrir esta ventana para usar Firebase CLI.
        pause
        exit /b 0
    ) else (
        echo [✗] Firebase CLI es necesario para continuar.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('firebase --version') do set FIREBASE_VERSION=%%i
    echo [✓] Firebase CLI encontrado: %FIREBASE_VERSION%
    echo.
)

REM Verificar si ya está logueado
echo [4/6] Verificando sesión de Firebase...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo [⚠] No estás logueado en Firebase.
    echo.
    set /p login="¿Deseas iniciar sesión ahora? (S/N): "
    if /i "%login%"=="S" (
        echo.
        echo [→] Abriendo navegador para iniciar sesión...
        firebase login
        if %errorlevel% neq 0 (
            echo [✗] Error al iniciar sesión.
            pause
            exit /b 1
        )
        echo [✓] Sesión iniciada correctamente.
        echo.
    ) else (
        echo [✗] Es necesario iniciar sesión para continuar.
        pause
        exit /b 1
    )
) else (
    echo [✓] Ya estás logueado en Firebase.
    echo.
)

REM Verificar si Firebase está inicializado
echo [5/6] Verificando configuración de Firebase...
if not exist ".firebaserc" (
    echo [⚠] Firebase no está inicializado en este proyecto.
    echo.
    set /p init="¿Deseas inicializar Firestore ahora? (S/N): "
    if /i "%init%"=="S" (
        echo.
        echo [→] Inicializando Firestore...
        echo.
        echo INSTRUCCIONES:
        echo - Cuando te pregunte por el archivo de reglas, presiona Enter (usa firestore.rules)
        echo - Cuando te pregunte por índices, presiona Enter (déjalo vacío)
        echo - Selecciona tu proyecto de la lista usando las flechas ↑↓ y Enter
        echo.
        pause
        firebase init firestore
        if %errorlevel% neq 0 (
            echo [✗] Error al inicializar Firestore.
            pause
            exit /b 1
        )
        echo [✓] Firestore inicializado correctamente.
        echo.
    ) else (
        echo [⚠] Debes inicializar Firestore antes de desplegar reglas.
        echo.
        pause
        exit /b 0
    )
) else (
    echo [✓] Firebase ya está inicializado.
    echo.
)

REM Desplegar reglas
echo [6/6] Desplegando reglas de seguridad de Firestore...
echo.
set /p deploy="¿Deseas desplegar las reglas de seguridad ahora? (S/N): "
if /i "%deploy%"=="S" (
    echo.
    echo [→] Desplegando reglas...
    firebase deploy --only firestore:rules
    if %errorlevel% neq 0 (
        echo [✗] Error al desplegar las reglas.
        pause
        exit /b 1
    )
    echo.
    echo [✓] Reglas desplegadas correctamente.
    echo.
) else (
    echo [⚠] No se desplegaron las reglas. Puedes hacerlo después con:
    echo     firebase deploy --only firestore:rules
    echo.
)

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    CONFIGURACIÓN COMPLETA                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo [✓] Firebase está configurado correctamente.
echo.
echo PRÓXIMOS PASOS:
echo 1. Asegúrate de tener las credenciales de Firebase en .env.local
echo 2. Reinicia el servidor de desarrollo: npm run dev
echo 3. Abre http://localhost:3000 en tu navegador
echo.
pause
