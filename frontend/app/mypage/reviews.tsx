import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api';
import { ReviewResponse } from '../../api/types';
import { getCurrentUser } from '../../state/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import StarRatingDisplay from '../../components/star-rating-display';

export default function MyPageReviews() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const router = useRouter();

  const load = async () => {
    const user = getCurrentUser();
    if (!user) {
      setReviews([]);
      return;
    }
    try {
      const data = await api.getReviewsByUser(user.userId);
      setReviews(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (item: ReviewResponse) => {
    setEditingId(item.reviewId);
    setEditContent(item.content ?? '');
    setEditRating(item.rating ?? 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditRating('0');
  };

  const handleSave = async (item: ReviewResponse) => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('알림', '로그인이 필요합니다');
      return;
    }
    if (!editRating || editRating <= 0) {
      Alert.alert('알림', '평점을 1~5 사이 숫자로 입력하세요');
      return;
    }
    try {
      await api.updateReview(item.reviewId, user.userId, {
        userId: user.userId,
        festivalId: item.festivalId,
        rating: editRating,
        content: editContent,
      });
      cancelEdit();
      load();
    } catch (e) {
      Alert.alert('오류', '리뷰 수정 중 문제가 발생했습니다.');
    }
  };

  const handleDelete = (id: number) => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('알림', '로그인이 필요합니다');
      return;
    }
    Alert.alert('삭제 확인', '해당 리뷰를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteReview(id, user.userId);
            load();
          } catch (e) {
            Alert.alert('오류', '리뷰 삭제 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => String(item.reviewId)}
        renderItem={({ item }) => {
          const isEditing = editingId === item.reviewId;
          return (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({ pathname: '/festival-detail', params: { festivalId: String(item.festivalId) } })
              }
            >
              <View style={styles.header}>
                <Text style={styles.festival}>{item.festivalName || `축제 #${item.festivalId}`}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#FFB800" />
                  <Text style={styles.rating}>{item.rating?.toFixed(1)}</Text>
                </View>
              </View>

              {isEditing ? (
                <View style={styles.editBox}>
                  <StarRatingDisplay rating={editRating} size={22} onChange={(v) => setEditRating(v)} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editContent}
                    onChangeText={setEditContent}
                    placeholder="리뷰 내용을 입력하세요"
                    multiline
                  />
                </View>
              ) : (
                <Text style={styles.comment}>{item.content}</Text>
              )}

              <View style={styles.footer}>
                <Text style={styles.date}>{item.reviewDate || ''} 작성</Text>
                <View style={styles.actions}>
                  {isEditing ? (
                    <>
                      <Pressable onPress={() => handleSave(item)}>
                        <Text style={styles.editText}>저장</Text>
                      </Pressable>
                      <Pressable onPress={cancelEdit}>
                        <Text style={styles.cancelText}>취소</Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable onPress={() => startEdit(item)}>
                        <Text style={styles.editText}>수정</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDelete(item.reviewId)}>
                        <Text style={styles.deleteText}>삭제</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>작성한 리뷰가 없습니다.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  festival: { fontSize: 16, fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 16, color: '#FFB800', fontWeight: 'bold' },
  comment: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 10 },
  editBox: { marginBottom: 10, gap: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  date: { fontSize: 12, color: '#999' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  editText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  cancelText: { fontSize: 14, color: '#666', fontWeight: 'bold' },
  deleteText: { fontSize: 14, color: '#FF3B30', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
});
