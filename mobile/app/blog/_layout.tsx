import { Stack } from 'expo-router';
import { greenStackScreenOptions } from '../../src/constants/navigation';

export default function BlogStackLayout() {
  return (
    <Stack screenOptions={greenStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Blog Advance' }} />
      <Stack.Screen name="[id]" options={{ title: 'Artículo' }} />
    </Stack>
  );
}
