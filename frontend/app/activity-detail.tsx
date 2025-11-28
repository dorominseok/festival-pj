import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api';
import { Product } from '../api/types';
import { getCurrentUser } from '../state/auth';

const formatPrice = (p?: number | null) => (p ? p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원' : '0원');

const TIME_OPTIONS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

export default function ActivityDetailScreen() {
  const params = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [headCount, setHeadCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (params.item) {
        try {
          const parsed = JSON.parse(params.item as string);
          setProduct(parsed);
          if (parsed?.productId) {
            const fresh = await api.getProduct(Number(parsed.productId));
            setProduct(fresh);
          }
        } catch (e) {
          console.error('Failed to parse product param', e);
        }
      }
    };
    loadProduct();
  }, [params.item]);

  const decreaseCount = () => {
    if (headCount > 1) setHeadCount(headCount - 1);
  };
  const increaseCount = () => setHeadCount(headCount + 1);

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setShowTimePicker(false);
  };

  const handleFinalBooking = async () => {
    if (!product) return;
    if (!selectedDate) {
      Alert.alert('알림', '방문 날짜를 선택해주세요.');
      return;
    }
    if (!selectedTime) {
      Alert.alert('알림', '방문 시간을 선택해주세요.');
      return;
    }
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('로그인이 필요합니다.', '로그인 페이지로 이동할까요?', [
        { text: '취소', style: 'cancel' },
        { text: '이동', onPress: () => router.push('/my') },
      ]);
      return;
    }

    try {
      await api.createReservation({
        userId: user.userId,
        festivalId: product.festivalId,
        productId: product.productId,
        date: selectedDate,
        time: selectedTime,
        headCount,
      });

      Alert.alert(
        '예약 완료',
        `${product.name}\n${selectedDate} ${selectedTime}\n인원 ${headCount}명`,
        [{ text: '확인', onPress: () => router.back() }],
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert('오류', error?.message || '예약 중 문제가 발생했습니다.');
    }
  };

  const markedDates = selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#007AFF' } } : {};

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 20 }}>
          <Text>상품 정보를 불러오는 중입니다...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const TimePicker = (
    <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>방문 시간 선택</Text>
          <ScrollView>
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
                  onPress={() => handleSelectTime(t)}
                >
                  <Text style={[styles.timeChipText, selectedTime === t && styles.timeChipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Pressable style={styles.modalCloseBtn} onPress={() => setShowTimePicker(false)}>
            <Text style={styles.modalCloseText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#eee' }]} />
        )}

        <View style={styles.header}>
          <Text style={styles.festivalName}>{product.festivalName}</Text>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>1인 {formatPrice(product.price)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>방문 날짜</Text>
          <Calendar
            onDayPress={(day: any) => {
              setSelectedDate(day.dateString);
            }}
            markedDates={markedDates}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
            }}
          />
          {!selectedDate ? (
            <Text style={styles.placeholderInfo}>날짜를 선택해주세요.</Text>
          ) : (
            <Text style={styles.selectedInfo}>선택한 날짜: {selectedDate}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>방문 시간</Text>
          <Pressable style={styles.input} onPress={() => setShowTimePicker(true)}>
            <Text style={{ color: selectedTime ? '#000' : '#888' }}>
              {selectedTime ? selectedTime : '시간을 선택해주세요.'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예약 인원</Text>
          <View style={styles.counterContainer}>
            <Pressable style={styles.counterButton} onPress={decreaseCount}>
              <Text style={styles.counterButtonText}>-</Text>
            </Pressable>

            <Text style={styles.counterText}>{headCount}명</Text>

            <Pressable style={styles.counterButton} onPress={increaseCount}>
              <Text style={styles.counterButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>총 결제금액</Text>
          <Text style={styles.totalPrice}>{formatPrice(product.price * headCount)}</Text>
        </View>

        <Pressable
          style={[styles.bookButton, (!selectedDate || !selectedTime) && styles.bookButtonDisabled]}
          onPress={handleFinalBooking}
        >
          <Text style={styles.bookButtonText}>예약하기</Text>
        </Pressable>
      </View>

      {TimePicker}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  image: { width: '100%', height: 250 },
  header: { padding: 20 },
  festivalName: { fontSize: 14, color: '#666' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 4, marginBottom: 10 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  divider: { height: 8, backgroundColor: '#f5f5f5' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  placeholderInfo: { marginTop: 10, fontSize: 14, color: '#888' },
  selectedInfo: { marginTop: 10, fontSize: 16, color: '#007AFF', fontWeight: '600' },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  counterContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: { fontSize: 24, color: '#555' },
  counterText: { fontSize: 20, fontWeight: 'bold' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 12, color: '#666' },
  totalPrice: { fontSize: 20, fontWeight: 'bold' },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  bookButtonDisabled: { backgroundColor: '#ccc' },
  bookButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 70,
    alignItems: 'center',
  },
  timeChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  timeChipText: { color: '#444', fontWeight: '500' },
  timeChipTextActive: { color: '#fff', fontWeight: '700' },
  modalCloseBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  modalCloseText: { color: '#007AFF', fontWeight: 'bold' },
});
