import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { Festival } from '../api/types';
import { getCurrentUser } from '../state/auth';

export default function ReviewWriteScreen() {
  const { festivalId } = useLocalSearchParams<{ festivalId?: string }>();
  const router = useRouter();
  const fid = Number(festivalId);

  const [festival, setFestival] = useState<Festival | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState('');
  const [eligible, setEligible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!fid) return;
    api.getFestival(fid).then(setFestival).catch((e) => console.error(e));
  }, [fid]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!fid || !user) {
      setEligible(null);
      return;
    }
    api
      .checkReviewEligibility(user.userId, fid)
      .then(setEligible)
      .catch((e) => {
        console.error(e);
        setEligible(false);
      });
  }, [fid]);

  const submit = async () => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('알림', '로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '로그인', onPress: () => router.push('/my') },
      ]);
      return;
    }
    if (!fid) {
      Alert.alert('알림', '축제 정보가 없습니다.');
      return;
    }
    if (Number.isNaN(rating) || rating < 0.5 || rating > 5) {
      Alert.alert('알림', '별점은 0.5~5.0 사이에서 선택해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      const isEligible = await api.checkReviewEligibility(user.userId, fid);
      if (!isEligible) {
        Alert.alert('알림', '해당 축제의 상품을 예약한 사용자만 리뷰를 작성할 수 있습니다.');
        return;
      }

      await api.createReview({
        userId: user.userId,
        festivalId: fid,
        rating,
        content: content.trim(),
      });
      router.replace({ pathname: '/festival-detail', params: { festivalId: String(fid), refreshKey: String(Date.now()) } });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 403) {
        Alert.alert('알림', '해당 축제의 상품을 예약한 사용자만 리뷰를 작성할 수 있습니다.');
      } else if (status === 400) {
        Alert.alert('알림', '이미 리뷰를 작성했습니다.');
      } else {
        Alert.alert('알림', e?.message || '리뷰 작성 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>리뷰 작성</Text>
        {festival && <Text style={styles.subtitle}>{festival.title}</Text>}
        {eligible === false && (
          <Text style={{ color: '#d00', marginBottom: 10 }}>
            해당 축제의 상품을 예약한 사용자만 리뷰를 작성할 수 있습니다.
          </Text>
        )}

        <Text style={styles.label}>별점 (0.5 ~ 5.0)</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => {
            const iconName =
              rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline';
            return (
              <View key={star} style={styles.starWrapper}>
                <Ionicons name={iconName as any} size={32} color="#FFB800" />
                <Pressable
                  style={[styles.starHit, styles.leftHalf]}
                  onPress={() => setRating(star - 0.5)}
                />
                <Pressable
                  style={[styles.starHit, styles.rightHalf]}
                  onPress={() => setRating(star)}
                />
              </View>
            );
          })}
          <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
        </View>

        <Text style={styles.label}>내용</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={4}
          value={content}
          onChangeText={setContent}
          placeholder="축제에 대한 후기를 남겨주세요."
        />

        <Pressable style={styles.submitButton} onPress={submit}>
          <Text style={styles.submitText}>등록하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  textarea: { height: 120, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  starWrapper: { position: 'relative', width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  starHit: { position: 'absolute', top: 0, bottom: 0, width: '50%' },
  leftHalf: { left: 0 },
  rightHalf: { right: 0 },
  ratingValue: { marginLeft: 6, fontSize: 16, fontWeight: '600', color: '#555' },
});
