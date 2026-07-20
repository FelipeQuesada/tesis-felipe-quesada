import { Stack } from 'expo-router';
import { greenStackScreenOptions } from '../../../../src/constants/navigation';

export default function TeacherWorkshopDetailLayout() {
  return (
    <Stack screenOptions={greenStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Taller' }} />
      <Stack.Screen name="edit" options={{ title: 'Editar taller' }} />
      <Stack.Screen name="students" options={{ title: 'Alumnos' }} />
      <Stack.Screen name="sessions/new" options={{ title: 'Nueva fecha' }} />
    </Stack>
  );
}
