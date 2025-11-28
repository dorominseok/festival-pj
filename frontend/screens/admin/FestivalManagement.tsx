import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../api';
import { Festival } from '../../api/types';

const FestivalManagement: React.FC = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getUpcomingFestivals();
      setFestivals(data);
    } catch (e) {
      console.error('Failed to load festivals', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
      { text: '아니요', style: 'cancel' },
      {
        text: '네',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteFestival(id);
            load();
          } catch (e) {
            console.error('Failed to delete festival', e);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>축제 관리</Text>
        <Pressable style={styles.createButton} onPress={() => router.push('/admin/create-festival')}>
          <Text style={styles.createButtonText}>축제 등록</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={festivals}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.startDate} ~ {item.endDate}</Text>
              <Text style={styles.cardMeta}>{item.location}</Text>
              <Text style={styles.cardCategories}>{item.categories?.join(', ')}</Text>
              <View style={styles.cardActions}>
                <Pressable style={[styles.actionBtn, styles.editBtn]} onPress={() => router.push(`/admin/edit-festival?id=${item.id}`)}>
                  <Text style={styles.actionText}>수정</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(Number(item.id))}>
                  <Text style={[styles.actionText, { color: '#fff' }]}>삭제</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ padding: 16, color: '#666' }}>No upcoming festivals.</Text>}
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
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  cardMeta: { color: '#555', marginBottom: 4 },
  cardCategories: { color: '#007AFF', fontWeight: '600', marginTop: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  editBtn: { backgroundColor: '#fff' },
  deleteBtn: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  actionText: { color: '#007AFF', fontWeight: '700' },
});

export default FestivalManagement;
