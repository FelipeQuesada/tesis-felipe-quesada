import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePublishedBlogPost } from '../../src/hooks/useBlog';
import { useBlogEngagement } from '../../src/hooks/useBlogEngagement';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS } from '../../src/constants/theme';
import { blogCoverUri } from '../../src/lib/blogDisplay';
import { RemoteAssetImage } from '../../src/components/RemoteAssetImage';
import { listPublishedWorkshopsByTeacherId } from '../../src/services/workshops.service';
import type { User, Workshop } from '../../src/types';

function formatWorkshopPrice(w: Workshop): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: w.currency || 'ARS',
      maximumFractionDigits: 0,
    }).format(w.price);
  } catch {
    return `${w.currency ?? ''} ${w.price}`;
  }
}

function commenterDisplayName(user: User) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;
  if (user.displayName?.trim()) return user.displayName.trim();
  return user.email.split('@')[0] || 'Usuario';
}

export default function BlogPostScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const blogId =
    typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const { post, loading, error } = usePublishedBlogPost(blogId);
  const {
    loading: engagementLoading,
    loadError,
    likesCount,
    likedByMe,
    comments,
    liking,
    commenting,
    toggleLike,
    addComment,
  } = useBlogEngagement(blogId, user?.uid ?? null);

  const [commentText, setCommentText] = useState('');
  const [related, setRelated] = useState<Workshop[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: post?.title ? post.title.slice(0, 36) : 'Artículo',
    });
  }, [navigation, post?.title]);

  useEffect(() => {
    if (!post?.authorId?.trim()) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    setRelatedLoading(true);
    void listPublishedWorkshopsByTeacherId(post.authorId, 8)
      .then((list) => {
        if (!cancelled) setRelated(list);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [post?.authorId, post?.id]);

  const askLogin = (action: string) => {
    Alert.alert(
      'Iniciá sesión',
      `Para ${action} necesitás una cuenta.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir a login', onPress: () => router.push('/auth/login' as Href) },
      ]
    );
  };

  const handleLike = async () => {
    if (!user) {
      askLogin('dar me gusta');
      return;
    }
    try {
      await toggleLike();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo actualizar el me gusta.');
    }
  };

  const handlePublishComment = async () => {
    if (!user) {
      askLogin('comentar');
      return;
    }
    const cleaned = commentText.trim();
    if (cleaned.length < 2) {
      Alert.alert('Comentario', 'Escribí al menos 2 caracteres.');
      return;
    }
    try {
      await addComment(cleaned, commenterDisplayName(user));
      setCommentText('');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo publicar el comentario.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.muted}>Cargando artículo…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.err}>{error.message}</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.err}>Artículo no encontrado.</Text>
      </View>
    );
  }

  const coverUri = blogCoverUri(post.coverImageUrl);
  const dateLabel = post.publishedAt ?? post.createdAt;
  const dateStr = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
  }).format(dateLabel);

  const paragraphs = post.content.split(/\n\s*\n/).filter(Boolean);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <RemoteAssetImage
        uri={coverUri}
        containerStyle={styles.heroBox}
        style={styles.heroImg}
        accessibilityLabel={post.title}
      />

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        {post.authorName ? `${post.authorName} · ` : ''}
        {dateStr}
      </Text>

      {post.excerpt ? (
        <Text style={styles.excerpt}>{post.excerpt}</Text>
      ) : null}

      {paragraphs.map((block, i) => (
        <Text key={i} style={styles.paragraph}>
          {block.trim()}
        </Text>
      ))}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Me gusta</Text>
        {loadError ? (
          <Text style={styles.engagementErr}>
            No se pudieron cargar likes ni comentarios: {loadError}
          </Text>
        ) : null}
        {engagementLoading ? (
          <ActivityIndicator color={COLORS.primaryGreen} />
        ) : (
          <Pressable
            style={({ pressed }) => [styles.likeBtn, pressed && styles.pressed]}
            onPress={() => void handleLike()}
            disabled={liking}
          >
            <Ionicons
              name={likedByMe ? 'heart' : 'heart-outline'}
              size={22}
              color={likedByMe ? '#e53935' : COLORS.primaryGreenDark}
            />
            <Text style={styles.likeBtnText}>
              {likedByMe ? 'Te gusta' : 'Me gusta'} · {likesCount}
            </Text>
          </Pressable>
        )}
        {!user ? (
          <Text style={styles.hint}>
            Iniciá sesión para dar me gusta y comentar.
          </Text>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Comentarios ({comments.length})</Text>
        <TextInput
          style={styles.commentInput}
          value={commentText}
          onChangeText={setCommentText}
          placeholder={
            user ? 'Escribí tu comentario…' : 'Iniciá sesión para comentar'
          }
          placeholderTextColor="#94a3b8"
          multiline
          editable={!!user && !commenting}
          maxLength={1000}
        />
        <Pressable
          style={({ pressed }) => [
            styles.publishBtn,
            (!user || commenting) && styles.publishBtnDisabled,
            pressed && user && !commenting && styles.pressed,
          ]}
          onPress={() => void handlePublishComment()}
          disabled={!user || commenting}
        >
          <Text style={styles.publishBtnText}>
            {commenting ? 'Publicando…' : 'Publicar comentario'}
          </Text>
        </Pressable>

        {comments.length === 0 ? (
          <Text style={styles.emptyComments}>
            Aún no hay comentarios. Sé el primero en comentar.
          </Text>
        ) : (
          <View style={styles.commentList}>
            {comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>{c.userDisplayName}</Text>
                <Text style={styles.commentDate}>
                  {c.createdAt.toLocaleString('es-AR')}
                </Text>
                <Text style={styles.commentBody}>{c.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.relatedBlock}>
        <Text style={styles.relatedTitle}>Talleres relacionados</Text>
        <Text style={styles.relatedSubtitle}>
          Talleres publicados del mismo autor del blog.
        </Text>
        {relatedLoading ? (
          <ActivityIndicator color={COLORS.primaryGreen} style={{ marginTop: 8 }} />
        ) : related.length === 0 ? (
          <Text style={styles.hint}>
            No hay talleres publicados de este autor por ahora.
          </Text>
        ) : (
          related.map((w) => (
            <Pressable
              key={w.id}
              style={({ pressed }) => [
                styles.relatedRow,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(`/workshops/${w.id}` as Href)}
            >
              <Text style={styles.relatedRowTitle} numberOfLines={2}>
                {w.title}
              </Text>
              <Text style={styles.relatedRowMeta}>
                {formatWorkshopPrice(w)}
                {w.location?.addressText
                  ? ` · ${w.location.addressText}`
                  : ''}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  muted: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  err: {
    color: '#b91c1c',
    fontSize: 15,
    textAlign: 'center',
  },
  engagementErr: {
    color: '#b91c1c',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  heroBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#e2e8f0',
  },
  heroImg: {
    width: '100%',
    height: 220,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 20,
    paddingHorizontal: 16,
    lineHeight: 32,
  },
  meta: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  excerpt: {
    fontSize: 17,
    color: COLORS.textSecondary,
    lineHeight: 26,
    marginTop: 16,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  paragraph: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionCard: {
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.surface,
  },
  likeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreenDark,
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  commentInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    backgroundColor: COLORS.surface,
    marginBottom: 10,
  },
  publishBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 16,
  },
  publishBtnDisabled: {
    opacity: 0.45,
  },
  publishBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyComments: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  commentList: {
    gap: 10,
  },
  commentItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  commentBody: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  relatedBlock: {
    marginTop: 28,
    paddingTop: 20,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  relatedSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  relatedRow: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  relatedRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  relatedRowMeta: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.9,
  },
});
