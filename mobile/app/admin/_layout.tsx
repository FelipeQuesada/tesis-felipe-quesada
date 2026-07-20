import { Stack } from 'expo-router';
import { greenStackScreenOptions } from '../../src/constants/navigation';

export default function AdminLayout() {
  return (
    <Stack screenOptions={greenStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Administración' }} />
    </Stack>
  );
}
