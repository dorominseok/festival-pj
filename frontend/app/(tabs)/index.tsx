import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../api';
import { Festival } from '../../api/types';
import { getWishlist, subscribe as subscribeWishlist, toggleWishlist } from '../../state/wishlist';
import { getCurrentUser } from '../../state/auth';

const USER_LOCATION = { lat: 35.8459, lng: 129.2319 };

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getDaysDifference = (date1: Date, date2: Date) => {
  const oneDay = 86400000;
  return Math.round((date1.getTime() - date2.getTime()) / oneDay);
};

type FestivalCardProps = {
  item: Festival;
  isEnded: boolean;
  isLiked: boolean;
  onToggleLike: (festival: Festival) => void;
  onPress: (festivalId: number) => void;
};

const FestivalCard = ({ item, isEnded, isLiked, onToggleLike, onPress }: FestivalCardProps) => {
  const distance =
    item.lat && item.lng
      ? getDistance(USER_LOCATION.lat, USER_LOCATION.lng, item.lat, item.lng).toFixed(1)
      : '-';

  const imageSrc = item.imageUrl
    ? { uri: item.imageUrl }
    : { uri: 'https://via.placeholder.com/400x250?text=Festival' };

  return (
    <Pressable style={[styles.card, isEnded && styles.cardEnded]} onPress={() => onPress(item.id)}>
      <Image source={imageSrc} style={[styles.cardImage, isEnded && styles.imageEnded]} />

      <Pressable style={styles.heartButton} onPress={() => onToggleLike(item)} hitSlop={10}>
        <Ionicons size={24} name={isLiked ? 'heart' : 'heart-outline'} color={isLiked ? '#FF3B30' : '#fff'} />
      </Pressable>

      {isEnded && (
        <View style={styles.endedBadge}>
          <Text style={styles.endedBadgeText}>종료</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View style={styles.tagContainer}>
            {item.categories?.map((cat, idx) => (
              <View key={idx} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{cat}</Text>
              </View>
            ))}
          </View>
          {item.averageRating != null ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
            </View>
          ) : (
            <Text style={styles.ratingText}>평점 없음</Text>
          )}
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDate}>
          {item.startDate} ~ {item.endDate}
        </Text>

        <View style={styles.locationRow}>
          <Text style={styles.cardLocation}>{item.location}</Text>
          <Text style={styles.distanceText}>{distance}km</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default function HomeScreen() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [recommendedFestivals, setRecommendedFestivals] = useState<Festival[] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [viewType, setViewType] = useState<'ongoing' | 'ended'>('ongoing');
  const [sortBy, setSortBy] = useState<'default' | 'nearby' | 'rating' | 'recommended'>('default');
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const router = useRouter();

  const loadFestivals = useCallback(async () => {
    try {
      const fData = await api.getFestivals();
      setFestivals(fData);
    } catch (e) {
      console.error('API Error:', e);
    }
  }, []);

  useEffect(() => {
    loadFestivals();
  }, [loadFestivals]);

  useFocusEffect(
    useCallback(() => {
      loadFestivals();
    }, [loadFestivals])
  );

  useEffect(() => {
    const unsubscribe = subscribeWishlist((list) => setWishlistIds(list.map((f) => f.id)));
    setWishlistIds(getWishlist().map((f) => f.id));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (sortBy !== 'recommended' || !user) {
      return;
    }
    api
      .getRecommendedFestivals(user.userId)
      .then(setRecommendedFestivals)
      .catch((e) => {
        console.error('Failed to load recommended festivals', e);
        Alert.alert('알림', '추천 순 정렬을 불러오지 못했습니다.');
      });
  }, [sortBy]);

  const handleToggleLike = (festival: Festival) => {
    const updated = toggleWishlist(festival);
    setWishlistIds(updated.map((f) => f.id));
  };

  const filteredData = useMemo(() => {
    const now = new Date();

    let source = sortBy === 'recommended' && recommendedFestivals ? recommendedFestivals : festivals;

    if (sortBy === 'recommended') {
      const user = getCurrentUser();
      const interests =
        user?.interests ??
        (user?.interest
          ? user.interest
              .split(',')
              .map((i) => i.trim())
              .filter(Boolean)
          : []);

      if (interests.length) {
        const normalizedInterests = interests.map((i) => i.toLowerCase());
        const normalize = (val: string) => val.trim().toLowerCase();
        const hasInterestMatch = (item: Festival) => {
          const categories =
            (item.categories && item.categories.length ? item.categories : item.category ? item.category.split(',') : []) ||
            [];
          return categories.some((c) => normalizedInterests.includes(normalize(c)));
        };

        const matched = source.filter(hasInterestMatch);
        const unmatched = source.filter((item) => !hasInterestMatch(item));
        source = [...matched, ...unmatched];
      }
    }

    let list = source.filter((item) => {
      const end = new Date(item.endDate);
      const diff = getDaysDifference(now, end);
      if (viewType === 'ongoing') return diff <= 0;
      return diff > 0 && diff <= 7;
    });

    if (searchText.trim()) {
      list = list.filter((f) => f.title.toLowerCase().includes(searchText.toLowerCase()));
    }

    if (sortBy === 'nearby') {
      list = [...list].sort((a, b) => {
        const distA = a.lat && a.lng ? getDistance(USER_LOCATION.lat, USER_LOCATION.lng, a.lat, a.lng) : 99999;
        const distB = b.lat && b.lng ? getDistance(USER_LOCATION.lat, USER_LOCATION.lng, b.lat, b.lng) : 99999;
        return distA - distB;
      });
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    }

    return list;
  }, [festivals, recommendedFestivals, searchText, viewType, sortBy]);

  const handlePressFestival = (festivalId: number) => {
    router.push({ pathname: '/festival-detail', params: { festivalId: String(festivalId) } });
  };

  const handleSortChange = (key: 'default' | 'nearby' | 'rating' | 'recommended') => {
    if (key === 'recommended') {
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('알림', '추천 정렬은 로그인 후 이용 가능합니다.');
        return;
      }
    }
    setSortBy(key);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>축제 모아보기</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={22} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="축제 검색"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.tabSwitchContainer}>
          <Pressable
            style={[styles.tabButton, viewType === 'ongoing' && styles.tabButtonActive]}
            onPress={() => setViewType('ongoing')}
          >
            <Text style={[styles.tabText, viewType === 'ongoing' && styles.tabTextActive]}>진행/예정</Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, viewType === 'ended' && styles.tabButtonActive]}
            onPress={() => setViewType('ended')}
          >
            <Text style={[styles.tabText, viewType === 'ended' && styles.tabTextActive]}>최근 종료</Text>
          </Pressable>
        </View>

        <View style={styles.filterContainer}>
          {[
            { key: 'default', label: '기본' },
            { key: 'nearby', label: '가까운 순' },
            { key: 'rating', label: '별점 순' },
            { key: 'recommended', label: '추천' },
          ].map((b) => (
            <Pressable
              key={b.key}
              style={[styles.filterButton, sortBy === b.key && styles.filterButtonActive]}
              onPress={() => handleSortChange(b.key as any)}
            >
              <Text style={[styles.filterText, sortBy === b.key && styles.filterTextActive]}>{b.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FestivalCard
            item={item}
            isEnded={viewType === 'ended'}
            isLiked={wishlistIds.includes(item.id)}
            onToggleLike={handleToggleLike}
            onPress={handlePressFestival}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 15,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 4,
    marginBottom: 15,
  },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  tabButtonActive: { backgroundColor: '#fff', borderRadius: 6 },
  tabText: { fontSize: 14, color: '#777' },
  tabTextActive: { color: '#007AFF', fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardEnded: { opacity: 0.75 },
  cardImage: { width: '100%', height: 180, resizeMode: 'cover' },
  imageEnded: { opacity: 0.6 },
  endedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  endedBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heartButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  cardContent: { padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tagContainer: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  categoryTag: { backgroundColor: '#EAF4FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: '#FF9500' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  cardDate: { color: '#555', marginBottom: 6 },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLocation: { color: '#444' },
  distanceText: { fontWeight: 'bold', color: '#666' },
});
