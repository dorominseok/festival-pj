import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../api';
import { Product } from '../../api/types';

const productTypes = ['food', 'goods', 'activity'];

const CreateActivity: React.FC = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState({
    festivalId: '',
    name: '',
    price: '',
    originalPrice: '',
    stock: '',
    productType: 'activity',
    imageUrl: '',
    description: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data: Product = await api.getProduct(Number(id));
        setForm({
          festivalId: data.festivalId ? String(data.festivalId) : '',
          name: data.name || '',
          price: data.price != null ? String(data.price) : '',
          originalPrice: data.originalPrice != null ? String(data.originalPrice) : '',
          stock: data.stock != null ? String(data.stock) : '',
          productType: data.productType || 'activity',
          imageUrl: data.imageUrl || '',
          description: data.description || '',
        });
      } catch (e) {
        Alert.alert('오류', '액티비티 정보를 불러오지 못했습니다.');
      }
    };
    load();
  }, [id]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.festivalId || !form.name || !form.price || !form.stock) {
      Alert.alert('필수 입력', '축제 ID, 이름, 가격, 재고를 입력해주세요.');
      return;
    }

    const payload = {
      festival: { festivalId: Number(form.festivalId) },
      name: form.name,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      productType: form.productType,
      imageUrl: form.imageUrl,
      description: form.description,
    };

    try {
      if (isEdit) {
        await api.updateProduct(Number(id), payload);
        Alert.alert('완료', '액티비티가 수정되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
      } else {
        await api.createProduct(payload);
        Alert.alert('완료', '액티비티가 등록되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
      }
    } catch (e: any) {
      Alert.alert('에러', e?.message || '처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEdit ? '액티비티 수정' : '액티비티 등록'}</Text>
      {[
        { key: 'festivalId', label: '축제 ID', keyboardType: 'numeric' as const },
        { key: 'name', label: '이름' },
        { key: 'price', label: '가격', keyboardType: 'numeric' as const },
        { key: 'originalPrice', label: '할인가(선택)', keyboardType: 'numeric' as const },
        { key: 'stock', label: '재고', keyboardType: 'numeric' as const },
        { key: 'productType', label: '유형 (food/goods/activity)' },
        { key: 'imageUrl', label: '이미지 URL' },
        { key: 'description', label: '설명', multiline: true },
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
        <Text style={styles.buttonText}>{isEdit ? '액티비티 수정' : '액티비티 등록'}</Text>
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

export default CreateActivity;
