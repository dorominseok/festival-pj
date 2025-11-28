import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../api';
import { Festival } from '../../api/types';

const CreateFestival: React.FC = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState({
    category: '',
    description: '',
    end_date: '',
    location: '',
    name: '',
    region: '',
    start_date: '',
    image_url: '',
    lat: '',
    lng: '',
    categories: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data: Festival = await api.getFestival(Number(id));
        setForm({
          category: data.category || '',
          categories: data.categories?.join(', ') || '',
          description: data.description || '',
          end_date: data.endDate || '',
          location: data.location || '',
          name: data.name || data.title || '',
          region: data.region || '',
          start_date: data.startDate || '',
          image_url: data.imageUrl || '',
          lat: data.lat != null ? String(data.lat) : '',
          lng: data.lng != null ? String(data.lng) : '',
        });
      } catch (e) {
        Alert.alert('오류', '축제 정보를 불러오지 못했습니다.');
      }
    };
    load();
  }, [id]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      Alert.alert('필수 입력', '이름, 시작일, 종료일을 입력해주세요.');
      return;
    }

    const payload = {
      category: form.category,
      description: form.description,
      end_date: form.end_date,
      location: form.location,
      name: form.name,
      region: form.region,
      start_date: form.start_date,
      image_url: form.image_url,
      lat: parseFloat(form.lat || '0'),
      lng: parseFloat(form.lng || '0'),
      categories: form.categories,
    };

    try {
      if (isEdit) {
        await api.updateFestival(Number(id), payload);
        Alert.alert('완료', '축제가 수정되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
      } else {
        await api.createFestival(payload);
        Alert.alert('완료', '축제가 등록되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
      }
    } catch (e: any) {
      Alert.alert('에러', e?.message || '처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEdit ? '축제 수정' : '축제 등록'}</Text>
      {[
        { key: 'name', label: '축제 이름' },
        { key: 'category', label: '주요 카테고리' },
        { key: 'categories', label: '카테고리 목록 (쉼표로 구분)' },
        { key: 'description', label: '설명', multiline: true },
        { key: 'location', label: '위치' },
        { key: 'region', label: '지역' },
        { key: 'start_date', label: '시작일 (YYYY-MM-DD)' },
        { key: 'end_date', label: '종료일 (YYYY-MM-DD)' },
        { key: 'image_url', label: '이미지 URL' },
        { key: 'lat', label: '위도', keyboardType: 'numeric' as const },
        { key: 'lng', label: '경도', keyboardType: 'numeric' as const },
      ].map((field) => (
        <View key={field.key} style={{ marginBottom: 12 }}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={[styles.input, field.multiline && styles.multiline]}
            value={form[field.key as keyof typeof form]}
            onChangeText={(v) => handleChange(field.key as keyof typeof form, v)}
            placeholder={field.label}
            multiline={!!field.multiline}
            keyboardType={field.keyboardType || 'default'}
          />
        </View>
      ))}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isEdit ? '축제 수정' : '축제 등록'}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  button: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default CreateFestival;
