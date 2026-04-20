@echo off
REM Script para navegar al directorio del proyecto y ejecutar comandos de Firebase

REM Cambiar a la unidad D:
D:

REM Cambiar al directorio del proyecto
cd "D:\Archivos\Desktop\tesis-Felipe Quesada"

REM Mostrar el directorio actual
echo.
echo ========================================
echo Directorio actual:
cd
echo ========================================
echo.

REM Verificar si firebase-tools está instalado
where firebase >nul 2>&1
if %errorlevel% neq 0 (
    echo Firebase CLI no está instalado.
    echo.
    echo Para instalar, ejecuta:
    echo npm install -g firebase-tools
    echo.
    pause
    exit /b
)

REM Mostrar opciones
echo ¿Qué quieres hacer?
echo.
echo 1. Iniciar sesión en Firebase (firebase login)
echo 2. Inicializar Firestore (firebase init firestore)
echo 3. Desplegar reglas de seguridad (firebase deploy --only firestore:rules)
echo 4. Abrir PowerShell aquí
echo 5. Salir
echo.
set /p opcion="Elige una opción (1-5): "

if "%opcion%"=="1" (
    echo.
    echo Iniciando sesión en Firebase...
    firebase login
    goto :end
)

if "%opcion%"=="2" (
    echo.
    echo Inicializando Firestore...
    firebase init firestore
    goto :end
)

if "%opcion%"=="3" (
    echo.
    echo Desplegando reglas de seguridad...
    firebase deploy --only firestore:rules
    goto :end
)

if "%opcion%"=="4" (
    echo.
    echo Abriendo PowerShell...
    powershell
    goto :end
)

if "%opcion%"=="5" (
    exit /b
)

:end
echo.
pause
