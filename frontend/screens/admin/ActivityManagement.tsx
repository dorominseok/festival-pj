import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../api';
import { Product } from '../../api/types';

const ActivityManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      console.error('Failed to load activities', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
      { text: '아니요', style: 'cancel' },
      {
        text: '네',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteProduct(id);
            load();
          } catch (e) {
            console.error('Failed to delete activity', e);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>액티비티 관리</Text>
        <Pressable style={styles.createButton} onPress={() => router.push('/admin/create-activity')}>
          <Text style={styles.createButtonText}>액티비티 등록</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.productId)}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.festivalName || `축제 ID: ${item.festivalId}`}</Text>
              <Text style={styles.cardMeta}>
                {item.price?.toLocaleString()}원 {item.productType ? `· ${item.productType}` : ''}
              </Text>
              <Text style={styles.cardMeta}>재고: {item.stock}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <View style={styles.cardActions}>
                <Pressable
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => router.push(`/admin/edit-activity?id=${item.productId}`)}
                >
                  <Text style={styles.actionText}>수정</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(Number(item.productId))}
                >
                  <Text style={[styles.actionText, { color: '#fff' }]}>삭제</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ padding: 16, color: '#666' }}>등록된 액티비티가 없습니다.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  createButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  createButtonText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  cardMeta: { color: '#555', marginBottom: 4 },
  cardDesc: { color: '#666', marginTop: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  editBtn: { backgroundColor: '#fff' },
  deleteBtn: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  actionText: { color: '#007AFF', fontWeight: '700' },
});

export default ActivityManagement;
