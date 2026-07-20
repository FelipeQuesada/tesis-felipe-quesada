import { Stack } from 'expo-router';
import { greenStackScreenOptions } from '../../src/constants/navigation';

export default function TeacherLayout() {
  return (
    <Stack screenOptions={greenStackScreenOptions}>
      <Stack.Screen name="home" options={{ title: 'Profesor' }} />
      <Stack.Screen name="account" options={{ title: 'Cuenta' }} />
      <Stack.Screen name="workshops" options={{ headerShown: false }} />
    </Stack>
  );
}
