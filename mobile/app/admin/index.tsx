import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function AdminHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administración</Text>
      <Text style={styles.body}>
        Base lista: usuarios, talleres, blog y estadísticas (paridad con la web).
      </Text>
      <Link href="/" asChild>
        <Pressable style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}>
          <Text style={styles.linkBtnText}>Ir al inicio / pestañas</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },
  body: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24,
  },
  linkBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  pressed: { opacity: 0.85 },
  linkBtnText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
});
