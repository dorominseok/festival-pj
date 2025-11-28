import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api';
import { Product } from '../../api/types';

const formatPrice = (price: number | null | undefined) => {
  if (!price) return '0원';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
};

const ActivityCard = ({ item }: { item: Product }) => {
  const discountRate =
    item.originalPrice && item.originalPrice > 0
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

  const goToDetail = () => {
    router.push({
      pathname: '/activity-detail',
      params: { item: JSON.stringify(item) },
    });
  };

  return (
    <Pressable style={styles.card} onPress={goToDetail}>
      <Image
        source={{
          uri: item.imageUrl ? item.imageUrl : 'https://via.placeholder.com/400x250?text=Product',
        }}
        style={styles.cardImage}
      />

      <View style={styles.cardContent}>
        <Text style={styles.festivalName}>{item.festivalName}</Text>
        <Text style={styles.title}>{item.name}</Text>

        <View style={styles.priceContainer}>
          <View style={styles.priceInfo}>
            {item.originalPrice ? <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text> : null}
            <View style={styles.discountRow}>
              {discountRate > 0 ? <Text style={styles.discountRate}>{discountRate}%</Text> : null}
              <Text style={styles.finalPrice}>{formatPrice(item.price)}</Text>
            </View>
          </View>

          <View style={styles.bookButton}>
            <Text style={styles.bookButtonText}>예약하기</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default function ExploreScreen() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (e) {
        console.error('Products API Error:', e);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>액티비티 예약</Text>
        <Text style={styles.headerSubtitle}>축제를 200% 즐길 방법</Text>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => <ActivityCard item={item} />}
        keyExtractor={(item) => String(item.productId)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 30, alignItems: 'center' }}>
            <Text style={{ color: '#777' }}>불러오는 중이거나 상품이 없습니다...</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: '#666' },
  listContainer: { padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardImage: { width: '100%', height: 160, resizeMode: 'cover' },

  cardContent: { padding: 16 },
  festivalName: { fontSize: 14, color: '#666', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },

  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priceInfo: { flexDirection: 'column' },

  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },

  discountRow: { flexDirection: 'row', alignItems: 'center' },

  discountRate: { fontSize: 18, fontWeight: 'bold', color: '#e02a2a', marginRight: 6 },
  finalPrice: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  bookButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
