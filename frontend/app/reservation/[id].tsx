import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api';
import { ReservationResponse } from '../../api/types';
import { getCurrentUser } from '../../state/auth';

const statusLabel: Record<string, string> = {
  ACTIVE: '예약 완료',
  RESERVED: '예약 완료',
  ATTENDED: '참석 완료',
  CANCELLED: '예약 취소',
};
const getStatusLabel = (status: string) => statusLabel[status.toUpperCase()] ?? status;

export default function ReservationDetailScreen() {
  const { reservation } = useLocalSearchParams<{ reservation?: string }>();
  const router = useRouter();

  const initialData: ReservationResponse | null = useMemo(() => {
    if (!reservation) return null;
    try {
      return JSON.parse(reservation as string);
    } catch {
      return null;
    }
  }, [reservation]);

  const [data, setData] = useState<ReservationResponse | null>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>예약 정보를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCancel = () => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('로그인이 필요합니다');
      return;
    }
    Alert.alert('예약 취소', '해당 예약을 취소하시겠습니까?', [
      {
        text: '예',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await api.cancelReservation(data.reservationId, user.userId);
            const updated = res?.reservation ?? data;
            setData({ ...updated, status: 'CANCELLED' });
            Alert.alert('취소 완료', '예약이 취소되었습니다.');
          } catch (e) {
            Alert.alert('오류', '예약 취소 중 문제가 발생했습니다.');
          }
        },
      },
      { text: '아니오', style: 'cancel' },
    ]);
  };

  const isCancelled = data.status?.toUpperCase() === 'CANCELLED';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: data.product?.imageUrl || 'https://via.placeholder.com/400x250?text=Product' }}
          style={[styles.image, isCancelled && styles.imageCancelled]}
        />

        <Text style={[styles.title, isCancelled && styles.textCancelled]}>
          {data.productName || `상품 #${data.productId}`}
        </Text>
        <Text style={[styles.subtitle, isCancelled && styles.textCancelled]}>
          {data.festivalName || `축제 #${data.festivalId}`}
        </Text>

        <View style={styles.row}>
          <Text style={[styles.label, isCancelled && styles.textCancelled]}>예약일시</Text>
          <Text style={[styles.value, isCancelled && styles.textCancelled]}>
            {data.date} {data.time}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, isCancelled && styles.textCancelled]}>인원</Text>
          <Text style={[styles.value, isCancelled && styles.textCancelled]}>
            {data.headCount}명
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, isCancelled && styles.textCancelled]}>상태</Text>
          <Text style={[styles.value, isCancelled && styles.textCancelled]}>
            {getStatusLabel(data.status)}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>돌아가기</Text>
          </Pressable>
          <Pressable
            style={[styles.cancelBtn, isCancelled && styles.cancelBtnDisabled]}
            onPress={handleCancel}
            disabled={isCancelled}
          >
            <Text style={styles.cancelText}>{isCancelled ? '취소됨' : '예약 취소'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 12 },
  image: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#eee' },
  imageCancelled: { opacity: 0.45 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 15, color: '#666' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 15, fontWeight: '600', color: '#333' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 16 },
  backBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnDisabled: { backgroundColor: '#ffb3ad' },
  cancelText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  textCancelled: { color: '#777' },
});
