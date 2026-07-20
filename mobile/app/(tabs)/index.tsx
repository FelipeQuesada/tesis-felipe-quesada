import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS } from '../../src/constants/theme';
import { HOME_MAX_CONTENT_WIDTH } from '../../src/hooks/useHomeLayout';
import { HomeHeroHeader } from '../../src/components/home/HomeHeroHeader';
import { BlogAdvanceSection } from '../../src/components/home/BlogAdvanceSection';
import { LearnExploreSection } from '../../src/components/home/LearnExploreSection';
import { FeaturedWorkshopsSection } from '../../src/components/home/FeaturedWorkshopsSection';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      router.replace('/teacher/home');
    }
  }, [loading, user, router]);

  if (!loading && user?.role === 'teacher') {
    return <View style={styles.blank} />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <HomeHeroHeader />
      <View
        style={{
          maxWidth: HOME_MAX_CONTENT_WIDTH,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <BlogAdvanceSection />
        <LearnExploreSection />
        <FeaturedWorkshopsSection />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 24,
  },
  blank: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
