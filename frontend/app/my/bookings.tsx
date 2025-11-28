import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api';
import { getCurrentUser } from '../../state/auth';

type StatusNorm = 'ACTIVE' | 'ATTENDED' | 'CANCELLED' | 'UNKNOWN';

type BookingItem = {
  id: string;
  title: string;
  festivalName?: string;
  date: string;
  time: string;
  count: number;
  price?: string;
  status: string; // raw
  statusNormalized: StatusNorm;
  statusLabel: string;
  imageUrl?: string | null;
};

const statusPriority = (s: StatusNorm) => {
  if (s === 'ACTIVE') return 0;
  if (s === 'ATTENDED') return 1;
  if (s === 'CANCELLED') return 2;
  return 3;
};

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getReservationsByUser(user.userId);
        const mapped: BookingItem[] = data.map((r: any) => {
          const raw = (r.status || '').toString().toUpperCase();
          let statusNormalized: StatusNorm = 'UNKNOWN';
          if (raw === 'ACTIVE' || raw === 'RESERVED') statusNormalized = 'ACTIVE';
          else if (raw === 'ATTENDED') statusNormalized = 'ATTENDED';
          else if (raw === 'CANCELLED' || raw === 'CANCEELED') statusNormalized = 'CANCELLED';

          const statusLabel =
            statusNormalized === 'ACTIVE'
              ? '예약 완료'
              : statusNormalized === 'ATTENDED'
              ? '참석 완료'
              : statusNormalized === 'CANCELLED'
              ? '취소됨'
              : r.status || '';

          return {
            id: String(r.reservationId),
            title: r.productName || r.festivalName || '예약',
            festivalName: r.festivalName,
            date: r.date || '',
            time: r.time || '',
            count: r.headCount || 0,
            status: r.status || '',
            statusNormalized,
            statusLabel,
            imageUrl: r.product?.imageUrl || null,
          };
        });
        mapped.sort((a, b) => statusPriority(a.statusNormalized) - statusPriority(b.statusNormalized));
        setBookings(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                item.statusNormalized === 'CANCELLED' && styles.cardCancelled,
              ]}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.image,
                    item.statusNormalized === 'CANCELLED' && styles.imageCancelled,
                  ]}
                />
              ) : null}
              <View style={styles.header}>
                <Text
                  style={[
                    styles.date,
                    item.statusNormalized === 'CANCELLED' && styles.textCancelled,
                  ]}
                >
                  {item.date} {item.time}
                </Text>
                <Text
                  style={[
                    styles.status,
                    item.statusNormalized === 'ACTIVE'
                      ? styles.blue
                      : item.statusNormalized === 'ATTENDED'
                      ? styles.green
                      : styles.gray,
                  ]}
                >
                  {item.statusLabel}
                </Text>
              </View>
              <Text
                style={[
                  styles.title,
                  item.statusNormalized === 'CANCELLED' && styles.textCancelled,
                ]}
              >
                {item.title}
              </Text>
              {item.festivalName ? (
                <Text
                  style={[
                    styles.subtitle,
                    item.statusNormalized === 'CANCELLED' && styles.textCancelled,
                  ]}
                >
                  {item.festivalName}
                </Text>
              ) : null}
              <View style={styles.footer}>
                <Text
                  style={[
                    styles.info,
                    item.statusNormalized === 'CANCELLED' && styles.textCancelled,
                  ]}
                >
                  {item.count}명{item.price ? ` · ₩${item.price}` : ''}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 20 }}>
              <Text style={{ color: '#777' }}>예약 내역이 없습니다.</Text>
            </View>
          }
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardCancelled: { backgroundColor: '#e0e0e0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  date: { color: '#666', fontSize: 14 },
  status: { fontWeight: 'bold', fontSize: 14 },
  blue: { color: '#007AFF' },
  green: { color: '#2E8B57' },
  gray: { color: '#999' },
  image: { width: '100%', height: 150, borderRadius: 10, marginBottom: 10 },
  imageCancelled: { opacity: 0.45 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 6 },
  footer: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginTop: 10 },
  info: { fontSize: 16, color: '#333' },
  textCancelled: { color: '#777' },
});
