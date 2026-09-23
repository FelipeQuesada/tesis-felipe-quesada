import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { COLORS } from '../../constants/theme';

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submit = () => {
    const q = query.trim();
    router.push(
      (q ? `/workshops?q=${encodeURIComponent(q)}` : '/workshops') as Href
    );
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder="¿Qué querés aprender?"
        placeholderTextColor="#8a968e"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        onSubmitEditing={submit}
      />
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
        onPress={submit}
      >
        <Text style={styles.btnText}>Buscar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e0d8',
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#1b4332',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: COLORS.brandForest,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: COLORS.brandForest,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
