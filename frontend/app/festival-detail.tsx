import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../api';
import { Festival, ReviewResponse, ToxicityResult } from '../api/types';
import StarRatingDisplay from '../components/star-rating-display';

export default function FestivalDetailScreen() {
  const { festivalId, refreshKey } = useLocalSearchParams<{ festivalId?: string; refreshKey?: string }>();
  const router = useRouter();
  const id = Number(festivalId);

  const [festival, setFestival] = useState<Festival | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [fDetail, rList] = await Promise.all([api.getFestival(id), api.getReviewsByFestival(id)]);
      setFestival(fDetail);

      const badWordRegex = /(병신|존나|좆)/i;
      const classified = await Promise.all(
        rList.map(async (r) => {
          try {
            const tox = await api.classifyText(r.content);
            const toxicity: ToxicityResult = {
              labelId: tox.label_id,
              labelName: tox.label_name,
              score: tox.score,
            };
            const isToxic = badWordRegex.test(r.content);
            return { ...r, toxicity, isToxic };
          } catch (e) {
            return { ...r, isToxic: badWordRegex.test(r.content) };
          }
        })
      );
      setReviews(classified);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const goWriteReview = () => {
    if (!id) return;
    router.push({ pathname: '/review-write', params: { festivalId: String(id) } });
  };

  if (!id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>유효하지 않은 축제입니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        {festival && (
          <View style={styles.section}>
            <Text style={styles.title}>{festival.title}</Text>
            <Text style={styles.subtitle}>{festival.location}</Text>
            <Text style={styles.dateText}>
              {festival.startDate} ~ {festival.endDate}
            </Text>
            <Text style={styles.description}>{festival.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>리뷰</Text>
            <Pressable style={styles.writeButton} onPress={goWriteReview}>
              <Text style={styles.writeButtonText}>리뷰 작성하기</Text>
            </Pressable>
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>아직 등록된 리뷰가 없습니다.</Text>
          ) : (
            reviews.map((r) => {
              const toxic = r.isToxic;
              return (
                <View key={r.reviewId} style={[styles.reviewCard, toxic && styles.reviewCardToxic]}>
                  {toxic && (
                    <View style={styles.toxicBadge}>
                      <Text style={styles.toxicBadgeText}>악성 리뷰</Text>
                    </View>
                  )}
                  <View style={styles.reviewHeader}>
                    <StarRatingDisplay rating={r.rating ?? 0} size={18} />
                    <Text style={styles.reviewAuthor}>{r.userName || `사용자#${r.userId}`}</Text>
                  </View>
                  <Text style={styles.reviewContent}>{r.content}</Text>
                  {r.reviewDate && <Text style={styles.reviewDate}>{r.reviewDate}</Text>}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 20 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    zIndex: 10,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#d00', fontSize: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 4 },
  dateText: { fontSize: 14, color: '#777', marginBottom: 10 },
  description: { fontSize: 15, color: '#333', lineHeight: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  writeButton: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  writeButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#888', paddingVertical: 10 },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    position: 'relative',
  },
  reviewCardToxic: { backgroundColor: '#FFCCCC', borderColor: '#FF9999' },
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
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewAuthor: { fontSize: 13, color: '#555' },
  reviewContent: { fontSize: 15, color: '#333', marginBottom: 6 },
  reviewDate: { fontSize: 12, color: '#999' },
});
