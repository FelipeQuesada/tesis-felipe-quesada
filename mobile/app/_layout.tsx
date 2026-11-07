import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/contexts/AuthContext';
import { greenStackScreenOptions } from '../src/constants/navigation';
import { COLORS } from '../src/constants/theme';
import { silenceFirestoreNoise } from '../src/lib/silenceFirestoreNoise';
import { ensureFirebaseClient, warmUpFirestoreConnection } from '../src/lib/firebase';

// Antes que cualquier import de Firestore dispare logs.
silenceFirestoreNoise();

export default function RootLayout() {
  // Inicializar antes del primer fetch (los useEffect de pantallas hijas corren antes que este useEffect).
  try {
    ensureFirebaseClient();
  } catch (e) {
    console.warn('Firebase: revisá mobile/.env (EXPO_PUBLIC_*)', e);
  }

  useEffect(() => {
    try {
      ensureFirebaseClient();
      void warmUpFirestoreConnection().catch((e) => {
        console.warn('Firestore warm-up:', e);
      });
    } catch (e) {
      console.warn('Firebase: revisá mobile/.env (EXPO_PUBLIC_*)', e);
    }
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            ...greenStackScreenOptions,
            // Igual que Advance: sin esto el tab bar transparente deja ver el gris default (#f2f2f2).
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="teacher" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="blog" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/login"
            options={{ title: 'Iniciar sesión' }}
          />
          <Stack.Screen
            name="auth/register"
            options={{ title: 'Crear cuenta' }}
          />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ title: 'Recuperar contraseña' }}
          />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
