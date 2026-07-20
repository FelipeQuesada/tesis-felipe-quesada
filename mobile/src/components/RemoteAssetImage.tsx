import {
  Image,
  type ImageStyle,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri: string | null;
  /** Estilo del contenedor (View). */
  containerStyle?: StyleProp<ViewStyle>;
  /** Estilo de la imagen (solo cuando hay `uri`). */
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
}

export function RemoteAssetImage({
  uri,
  style,
  containerStyle,
  accessibilityLabel,
  placeholderIcon = 'image-outline',
}: Props) {
  if (!uri) {
    return (
      <View
        style={[styles.placeholder, containerStyle]}
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name={placeholderIcon} size={28} color="#94a3b8" />
      </View>
    );
  }

  return (
    <View style={[styles.clip, containerStyle]}>
      <Image
        source={{ uri }}
        style={[styles.fill, style]}
        accessibilityLabel={accessibilityLabel}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  clip: {
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
});
