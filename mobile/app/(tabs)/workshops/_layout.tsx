import { Stack } from 'expo-router';
import { greenStackScreenOptions } from '../../../src/constants/navigation';

export default function WorkshopsStackLayout() {
  return (
    <Stack screenOptions={greenStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Explorar' }} />
      <Stack.Screen name="[id]" options={{ title: 'Taller' }} />
    </Stack>
  );
}
