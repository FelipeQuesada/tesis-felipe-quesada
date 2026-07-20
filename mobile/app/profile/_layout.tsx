import { Stack } from 'expo-router';
import { greenStackScreenOptions } from '../../src/constants/navigation';

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={greenStackScreenOptions}>
      <Stack.Screen name="edit" options={{ title: 'Editar perfil' }} />
    </Stack>
  );
}
