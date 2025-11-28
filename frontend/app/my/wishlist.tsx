import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Festival } from '../../api/types';
import { getWishlist, subscribe as subscribeWishlist, toggleWishlist } from '../../state/wishlist';

export default function MyWishlistScreen() {
  const [wishlist, setWishlist] = useState<Festival[]>(getWishlist());
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const unsub = subscribeWishlist(setWishlist);
      setWishlist(getWishlist());
      return () => unsub();
    }, []),
  );

  const handleRemove = (id: number) => {
    const item = wishlist.find((w) => w.id === id);
    if (item) {
      setWishlist(toggleWishlist(item));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/festival-detail', params: { festivalId: String(item.id) } })}
          >
            <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/200' }} style={styles.image} />

            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>
                {item.startDate} ~ {item.endDate}
              </Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>

            <Pressable onPress={() => handleRemove(item.id)} style={styles.removeButton}>
              <Text style={styles.removeText}>삭제</Text>
            </Pressable>
          </Pressable>
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 찜한 축제가 없습니다.</Text>
            <Text style={styles.emptySubText}>마음에 드는 축제를 리스트에 추가해보세요.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  image: { width: 70, height: 70, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  date: { fontSize: 13, color: '#666', marginBottom: 2 },
  location: { fontSize: 12, color: '#999' },
  removeButton: { padding: 8 },
  removeText: { fontSize: 13, color: '#FF3B30', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#999' },
});
