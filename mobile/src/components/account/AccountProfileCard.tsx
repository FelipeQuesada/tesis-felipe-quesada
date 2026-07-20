import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

type Props = {
  displayName: string;
  email: string;
  photoURL?: string | null;
  /** Texto debajo del email (ej. indicación para editar). */
  hint?: string;
  /** Si se define, muestra pastilla de rol (Estudiante / Profesor). */
  roleLabel?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export function AccountProfileCard({
  displayName,
  email,
  photoURL,
  hint,
  roleLabel,
  onPress,
  style,
}: Props) {
  const initial =
    (displayName || email || 'U').trim().charAt(0).toUpperCase() || 'U';
  const uri = photoURL?.trim();

  const inner = (
    <>
      <View style={styles.avatarWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.avatarImg} resizeMode="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarTxt}>{initial}</Text>
          </View>
        )}
      </View>
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName || email}
        </Text>
        <Text style={styles.mail} numberOfLines={1}>
          {email}
        </Text>
        {roleLabel ? (
          <View style={styles.pill}>
            <Text style={styles.pillTxt}>{roleLabel}</Text>
          </View>
        ) : null}
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
        onPress={onPress}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{inner}</View>;
}

const AVATAR = 72;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  pressed: { opacity: 0.92 },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    backgroundColor: COLORS.primaryGreenLight,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreen,
  },
  avatarTxt: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  main: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  mail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryGreenLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 4,
  },
  pillTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryGreenDark,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
