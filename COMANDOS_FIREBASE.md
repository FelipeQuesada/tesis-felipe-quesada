# 🔧 Comandos para Configurar Firebase

## 📍 Problema: No puedo navegar al directorio

Si estás en **Command Prompt (cmd.exe)** y no puedes cambiar de directorio, sigue estos pasos:

### Opción 1: Usar el script automático (RECOMENDADO)

1. **Doble clic** en el archivo `iniciar-firebase.bat` que está en la raíz del proyecto
2. El script te llevará automáticamente al directorio correcto
3. Elige la opción que necesites

### Opción 2: Comandos manuales en Command Prompt

Abre **Command Prompt** y ejecuta estos comandos **en orden**:

```cmd
D:
cd "D:\Archivos\Desktop\tesis-Felipe Quesada"
```

### Opción 3: Usar PowerShell (MÁS FÁCIL)

1. Abre **PowerShell** (no Command Prompt)
2. Ejecuta:

```powershell
Set-Location "D:\Archivos\Desktop\tesis-Felipe Quesada"
```

O simplemente:

```powershell
cd "D:\Archivos\Desktop\tesis-Felipe Quesada"
```

---

## 🚀 Pasos para Configurar Firebase

Una vez que estés en el directorio correcto, ejecuta estos comandos **en orden**:

### 1. Instalar Firebase CLI (solo la primera vez)

```bash
npm install -g firebase-tools
```

### 2. Iniciar sesión en Firebase

```bash
firebase login
```

- Se abrirá tu navegador automáticamente
- Inicia sesión con tu cuenta de Google
- Autoriza el acceso

### 3. Inicializar Firestore

```bash
firebase init firestore
```

Cuando te pregunte:
- **"What file should be used for Firestore Rules?"**: Presiona **Enter** (usa `firestore.rules`)
- **"What file should be used for Firestore indexes?"**: Presiona **Enter** (déjalo vacío o usa `firestore.indexes.json`)
- **Selecciona tu proyecto**: Usa las flechas ↑↓ y presiona **Enter**

### 4. Desplegar las reglas de seguridad

```bash
firebase deploy --only firestore:rules
```

Deberías ver: **✔ Deployed Firestore Rules successfully**

---

## 🆘 Solución de Problemas

### Error: "firebase no se reconoce como comando"

**Solución**: Firebase CLI no está instalado o no está en el PATH.

```bash
npm install -g firebase-tools
```

Luego cierra y vuelve a abrir la terminal.

### Error: "npm no se reconoce como comando"

**Solución**: Node.js no está instalado o no está en el PATH.

1. Verifica que Node.js esté instalado: `node --version`
2. Si no está, instálalo desde [nodejs.org](https://nodejs.org/)
3. Reinicia la terminal después de instalar

### Error: No puedo cambiar de directorio

**En Command Prompt (cmd.exe)**:
```cmd
D:
cd "D:\Archivos\Desktop\tesis-Felipe Quesada"
```

**En PowerShell**:
```powershell
Set-Location "D:\Archivos\Desktop\tesis-Felipe Quesada"
```

O usa el script `iniciar-firebase.bat` haciendo doble clic.

### Error: "The system cannot find the path specified"

**Solución**: Verifica que la ruta existe:

```cmd
dir "D:\Archivos\Desktop"
```

Si no ves la carpeta `tesis-Felipe Quesada`, verifica el nombre exacto de la carpeta.

---

## ✅ Verificación

Para verificar que estás en el directorio correcto:

```bash
# Ver el directorio actual
cd

# Ver los archivos
dir

# Deberías ver: package.json, firebase.json, firestore.rules, etc.
```

---

## 📝 Nota Importante

- **Command Prompt (cmd.exe)**: Usa `cd` y `D:` para cambiar de unidad
- **PowerShell**: Usa `Set-Location` o `cd` (funciona mejor con rutas completas)
- **Recomendación**: Usa PowerShell o el script `iniciar-firebase.bat`
