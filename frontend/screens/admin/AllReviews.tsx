import React, { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api';
import { ReviewResponse } from '../../api/types';

const badWordRegex = /(병신|존나|좆)/i;

const AllReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await api.getAllReviews();
      const tagged = data.map((r) => ({
        ...r,
        isToxic: badWordRegex.test(r.content),
      }));
      setReviews(tagged);
    } catch (e) {
      console.error('Failed to load reviews', e);
      Alert.alert('오류', '리뷰를 불러오지 못했습니다. 서버 연결을 확인해주세요.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = async (id: number) => {
    try {
      await api.deleteReviewAdmin(id);
      load();
    } catch (e) {
      Alert.alert('삭제 실패', '리뷰 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <FlatList
      style={styles.list}
      data={reviews}
      keyExtractor={(item) => String(item.reviewId)}
      renderItem={({ item }) => (
        <View style={[styles.card, item.isToxic && styles.cardToxic]}>
          {item.isToxic && (
            <View style={styles.toxicBadge}>
              <Text style={styles.toxicBadgeText}>악성 리뷰</Text>
            </View>
          )}
          <View style={styles.cardHeader}>
            <Text style={styles.userName}>{item.userName || '익명'}</Text>
            <Pressable onPress={() => handleDelete(item.reviewId)}>
              <Ionicons name="trash" size={20} color="#FF3B30" />
            </Pressable>
          </View>
          <Text style={styles.content}>{item.content}</Text>
          <View style={styles.footer}>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
            <Text style={styles.festivalName}>{item.festivalName}</Text>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={{ padding: 16, color: '#666' }}>리뷰가 없습니다.</Text>}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
};

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#f9f9f9', padding: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardToxic: { backgroundColor: '#FFCCCC', borderColor: '#FF9999' },
  toxicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  toxicBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  userName: { fontWeight: '700', fontSize: 15 },
  content: { color: '#333', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { color: '#FF9500', fontWeight: '600' },
  festivalName: { color: '#666', fontSize: 12 },
});

export default AllReviews;
