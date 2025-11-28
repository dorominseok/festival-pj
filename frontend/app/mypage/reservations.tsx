import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api } from '../../api';
import { ReservationResponse } from '../../api/types';
import { getCurrentUser } from '../../state/auth';

type NormalizedStatus = 'ACTIVE' | 'ATTENDED' | 'CANCELLED' | 'UNKNOWN';

const statusLabel: Record<NormalizedStatus, string> = {
  ACTIVE: '예약 완료',
  ATTENDED: '참석 완료',
  CANCELLED: '취소됨',
  UNKNOWN: '',
};

const normalizeStatus = (status?: string): NormalizedStatus => {
  const upper = (status || '').toUpperCase();
  if (upper === 'ACTIVE' || upper === 'RESERVED') return 'ACTIVE';
  if (upper === 'ATTENDED') return 'ATTENDED';
  if (upper === 'CANCELLED' || upper === 'CANCEELED') return 'CANCELLED';
  return 'UNKNOWN';
};

const statusPriority = (s: NormalizedStatus) => {
  if (s === 'ACTIVE') return 0;
  if (s === 'ATTENDED') return 1;
  if (s === 'CANCELLED') return 2;
  return 3;
};

export default function MyPageReservations() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    api
      .getReservationsByUser(user.userId)
      .then((list) => {
        const sorted = [...list].sort(
          (a, b) => statusPriority(normalizeStatus(a.status)) - statusPriority(normalizeStatus(b.status))
        );
        setReservations(sorted);
      })
      .catch((e) => {
        console.error(e);
        Alert.alert('알림', '예약 내역을 불러오지 못했습니다.');
      });
  }, []);

  const renderItem = ({ item }: { item: ReservationResponse }) => {
    const statusNorm = normalizeStatus(item.status);
    const isCancelled = statusNorm === 'CANCELLED';
    const statusText = statusLabel[statusNorm];

    return (
      <Pressable
        style={[styles.card, isCancelled && styles.cardCancelled]}
        onPress={() =>
          router.push({
            pathname: '/reservation/[id]',
            params: { id: String(item.reservationId), reservation: JSON.stringify(item) },
          })
        }
      >
        <Image
          source={{
            uri: item.product?.imageUrl || 'https://via.placeholder.com/100x80?text=Product',
          }}
          style={[styles.image, isCancelled && styles.imageCancelled]}
        />
        <View style={styles.cardContent}>
          <Text style={[styles.productName, isCancelled && styles.textCancelled]}>
            {item.productName || `상품 #${item.productId}`}
          </Text>
          <Text style={[styles.festivalName, isCancelled && styles.textCancelled]}>
            {item.festivalName || `축제 #${item.festivalId}`}
          </Text>
          <Text style={[styles.dateText, isCancelled && styles.textCancelled]}>
            {item.date} {item.time}
          </Text>
          <Text style={[styles.metaText, isCancelled && styles.textCancelled]}>
            인원 {item.headCount}명 · {statusText}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.reservationId)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>예약 내역이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardCancelled: { backgroundColor: '#e0e0e0' },
  image: { width: 80, height: 70, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  imageCancelled: { opacity: 0.45 },
  cardContent: { flex: 1 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  festivalName: { fontSize: 13, color: '#666', marginTop: 2 },
  dateText: { fontSize: 13, color: '#555', marginTop: 4 },
  metaText: { fontSize: 12, color: '#777', marginTop: 2 },
  textCancelled: { color: '#777' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#888' },
});
