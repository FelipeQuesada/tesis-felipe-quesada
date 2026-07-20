import { Stack } from 'expo-router';
import { greenStackScreenOptions } from '../../../src/constants/navigation';

export default function TeacherWorkshopsLayout() {
  return (
    <Stack screenOptions={greenStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Mis Talleres' }} />
      <Stack.Screen name="new" options={{ title: 'Crear taller' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
