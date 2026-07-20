import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { COLORS } from '../../constants/theme';
import { TeacherBottomNav } from './TeacherBottomNav';

export function TeacherShell({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={styles.body}>{children}</View>
      <TeacherBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
  },
});
