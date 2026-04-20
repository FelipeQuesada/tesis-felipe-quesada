# Script de PowerShell para configuración automática de Firebase
# Ejecutar con: powershell -ExecutionPolicy Bypass -File "configurar-firebase.ps1"

$ErrorActionPreference = "Stop"

# Colores
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CONFIGURACIÓN AUTOMÁTICA DE FIREBASE PARA MITALLER      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del proyecto
$projectPath = "D:\Archivos\Desktop\tesis-Felipe Quesada"
if (-not (Test-Path $projectPath)) {
    Write-Error "[ERROR] No se encontró el directorio del proyecto: $projectPath"
    Read-Host "Presiona Enter para salir"
    exit 1
}

Set-Location $projectPath
Write-Success "[✓] Directorio del proyecto: $(Get-Location)"
Write-Host ""

# Verificar Node.js
Write-Info "[1/6] Verificando Node.js..."
try {
    $nodeVersion = node --version
    Write-Success "[✓] Node.js encontrado: $nodeVersion"
} catch {
    Write-Error "[✗] Node.js no está instalado o no está en el PATH."
    Write-Host "Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host ""

# Verificar npm
Write-Info "[2/6] Verificando npm..."
try {
    $npmVersion = npm --version
    Write-Success "[✓] npm encontrado: $npmVersion"
} catch {
    Write-Error "[✗] npm no está disponible."
    Read-Host "Presiona Enter para salir"
    exit 1
}
Write-Host ""

# Verificar/Instalar Firebase CLI
Write-Info "[3/6] Verificando Firebase CLI..."
try {
    $firebaseVersion = firebase --version
    Write-Success "[✓] Firebase CLI encontrado: $firebaseVersion"
} catch {
    Write-Warning "[⚠] Firebase CLI no está instalado."
    $instalar = Read-Host "¿Deseas instalarlo ahora? (S/N)"
    if ($instalar -eq "S" -or $instalar -eq "s") {
        Write-Host ""
        Write-Info "[→] Instalando Firebase CLI..."
        npm install -g firebase-tools
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[✗] Error al instalar Firebase CLI."
            Read-Host "Presiona Enter para salir"
            exit 1
        }
        Write-Success "[✓] Firebase CLI instalado correctamente."
        Write-Host ""
        Write-Warning "[⚠] IMPORTANTE: Cierra y vuelve a abrir esta ventana para usar Firebase CLI."
        Read-Host "Presiona Enter para salir"
        exit 0
    } else {
        Write-Error "[✗] Firebase CLI es necesario para continuar."
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}
Write-Host ""

# Verificar si ya está logueado
Write-Info "[4/6] Verificando sesión de Firebase..."
try {
    firebase projects:list | Out-Null
    Write-Success "[✓] Ya estás logueado en Firebase."
} catch {
    Write-Warning "[⚠] No estás logueado en Firebase."
    $login = Read-Host "¿Deseas iniciar sesión ahora? (S/N)"
    if ($login -eq "S" -or $login -eq "s") {
        Write-Host ""
        Write-Info "[→] Abriendo navegador para iniciar sesión..."
        firebase login
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[✗] Error al iniciar sesión."
            Read-Host "Presiona Enter para salir"
            exit 1
        }
        Write-Success "[✓] Sesión iniciada correctamente."
    } else {
        Write-Error "[✗] Es necesario iniciar sesión para continuar."
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}
Write-Host ""

# Verificar si Firebase está inicializado
Write-Info "[5/6] Verificando configuración de Firebase..."
if (-not (Test-Path ".firebaserc")) {
    Write-Warning "[⚠] Firebase no está inicializado en este proyecto."
    $init = Read-Host "¿Deseas inicializar Firestore ahora? (S/N)"
    if ($init -eq "S" -or $init -eq "s") {
        Write-Host ""
        Write-Info "[→] Inicializando Firestore..."
        Write-Host ""
        Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
        Write-Host "- Cuando te pregunte por el archivo de reglas, presiona Enter (usa firestore.rules)"
        Write-Host "- Cuando te pregunte por índices, presiona Enter (déjalo vacío)"
        Write-Host "- Selecciona tu proyecto de la lista usando las flechas ↑↓ y Enter"
        Write-Host ""
        Read-Host "Presiona Enter para continuar"
        firebase init firestore
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[✗] Error al inicializar Firestore."
            Read-Host "Presiona Enter para salir"
            exit 1
        }
        Write-Success "[✓] Firestore inicializado correctamente."
    } else {
        Write-Warning "[⚠] Debes inicializar Firestore antes de desplegar reglas."
        Read-Host "Presiona Enter para salir"
        exit 0
    }
} else {
    Write-Success "[✓] Firebase ya está inicializado."
}
Write-Host ""

# Desplegar reglas
Write-Info "[6/6] Desplegando reglas de seguridad de Firestore..."
$deploy = Read-Host "¿Deseas desplegar las reglas de seguridad ahora? (S/N)"
if ($deploy -eq "S" -or $deploy -eq "s") {
    Write-Host ""
    Write-Info "[→] Desplegando reglas..."
    firebase deploy --only firestore:rules
    if ($LASTEXITCODE -ne 0) {
        Write-Error "[✗] Error al desplegar las reglas."
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host ""
    Write-Success "[✓] Reglas desplegadas correctamente."
} else {
    Write-Warning "[⚠] No se desplegaron las reglas. Puedes hacerlo después con:"
    Write-Host "    firebase deploy --only firestore:rules" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    CONFIGURACIÓN COMPLETA                    ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Success "[✓] Firebase está configurado correctamente."
Write-Host ""
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "1. Asegúrate de tener las credenciales de Firebase en .env.local"
Write-Host "2. Reinicia el servidor de desarrollo: npm run dev"
Write-Host "3. Abre http://localhost:3000 en tu navegador"
Write-Host ""
Read-Host "Presiona Enter para salir"
