# Poblar Países y Ciudades en Firestore

Este script permite poblar la base de datos Firestore con países y ciudades para que los usuarios puedan seleccionarlos desde listas desplegables en lugar de escribir texto libre.

## Requisitos

1. Firebase configurado con las variables de entorno correctas
2. Permisos de escritura en Firestore
3. Node.js y npm instalados

## Cómo usar

1. **Ejecutar el script:**
   ```bash
   npm run populate-locations
   ```

2. **Verificar en Firebase Console:**
   - Ve a Firebase Console > Firestore Database
   - Deberías ver dos colecciones nuevas:
     - `countries` - Lista de países
     - `cities` - Lista de ciudades con referencia al país

## Estructura de datos

### Colección `countries`
```javascript
{
  id: "AR",  // Código ISO del país
  name: "Argentina",
  code: "AR"
}
```

### Colección `cities`
```javascript
{
  id: "AR_buenos_aires",  // ID único
  name: "Buenos Aires",
  province: "Buenos Aires",
  countryId: "AR",  // Referencia al país
  countryCode: "AR"
}
```

## Agregar más países y ciudades

Edita el archivo `scripts/populate-locations.ts` y agrega más países y ciudades en los arrays `COUNTRIES` y `ARGENTINA_CITIES` (o crea nuevos arrays para otros países).

Ejemplo:
```typescript
const COUNTRIES = [
  { id: 'AR', name: 'Argentina', code: 'AR' },
  { id: 'MX', name: 'México', code: 'MX' },
  { id: 'CL', name: 'Chile', code: 'CL' },
];

const MEXICO_CITIES = [
  { name: 'Ciudad de México', province: 'CDMX', countryCode: 'MX' },
  { name: 'Guadalajara', province: 'Jalisco', countryCode: 'MX' },
  // ...
];
```

Luego ejecuta el script nuevamente. El script es idempotente, puedes ejecutarlo múltiples veces sin duplicar datos.

## Notas

- El script usa el código del país como ID para facilitar las referencias
- Las ciudades usan un ID compuesto: `{countryCode}_{city_name}` en minúsculas y sin espacios
- Si necesitas agregar muchas ciudades, considera usar un archivo JSON o CSV y leerlo desde el script
