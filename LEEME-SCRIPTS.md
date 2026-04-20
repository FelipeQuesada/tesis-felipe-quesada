# 🚀 Scripts Automáticos de Configuración

## ⚡ Inicio Rápido

### Opción 1: Script Batch (MÁS FÁCIL - RECOMENDADO)

1. **Abre el Explorador de Windows**
2. **Navega a**: `D:\Archivos\Desktop\tesis-Felipe Quesada`
3. **Haz doble clic** en `configurar-firebase.bat`
4. **Sigue las instrucciones** en pantalla

El script automáticamente:
- ✅ Verifica que Node.js y npm estén instalados
- ✅ Instala Firebase CLI si es necesario
- ✅ Te ayuda a iniciar sesión en Firebase
- ✅ Inicializa Firestore
- ✅ Despliega las reglas de seguridad

---

### Opción 2: Script PowerShell (Más Avanzado)

1. **Abre PowerShell** (Click derecho > "Abrir PowerShell aquí")
2. **Ejecuta**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File "configurar-firebase.ps1"
   ```

---

## 📋 Qué hace cada script

### `configurar-firebase.bat`
- Script de Windows Batch (.bat)
- Funciona haciendo doble clic
- Guía paso a paso con menús interactivos
- Verifica e instala dependencias automáticamente

### `configurar-firebase.ps1`
- Script de PowerShell
- Más robusto y con mejor manejo de errores
- Mismo flujo que el .bat pero más avanzado

### `iniciar-firebase.bat`
- Script simple para navegar al directorio
- Menú de opciones para comandos individuales
- Útil si solo necesitas ejecutar un comando específico

---

## 🎯 Flujo Completo

1. **Ejecuta** `configurar-firebase.bat` (doble clic)
2. El script te preguntará:
   - ¿Instalar Firebase CLI? → Responde **S**
   - ¿Iniciar sesión? → Responde **S** (se abrirá el navegador)
   - ¿Inicializar Firestore? → Responde **S**
     - Selecciona tu proyecto de la lista
     - Presiona Enter para usar `firestore.rules`
   - ¿Desplegar reglas? → Responde **S**

3. **¡Listo!** Firebase está configurado

---

## ⚠️ Notas Importantes

- **Primera vez**: Si Firebase CLI no está instalado, el script lo instalará automáticamente
- **Después de instalar Firebase CLI**: Cierra y vuelve a abrir la ventana
- **Inicio de sesión**: Se abrirá tu navegador automáticamente
- **Selección de proyecto**: Usa las flechas ↑↓ para navegar y Enter para seleccionar

---

## 🆘 Problemas Comunes

### "No se puede ejecutar este script"
**Solución**: Haz doble clic en `configurar-firebase.bat` (no el .ps1)

### "Firebase no se reconoce"
**Solución**: 
1. El script te preguntará si quieres instalarlo → Responde **S**
2. Después de instalar, cierra y vuelve a abrir la ventana

### "No puedo cambiar de directorio"
**Solución**: Usa el script automático, él se encarga de navegar al directorio correcto

---

## ✅ Verificación

Después de ejecutar el script, verifica que todo esté bien:

```bash
# Verificar que Firebase CLI funciona
firebase --version

# Verificar que estás logueado
firebase projects:list

# Verificar que las reglas están desplegadas
firebase deploy --only firestore:rules
```

Si todo funciona, ¡ya puedes usar tu aplicación! 🎉
