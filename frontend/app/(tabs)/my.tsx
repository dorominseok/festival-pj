import React, { useEffect, useState } from 'react';
import { IconSymbol } from '../../components/ui/icon-symbol';
import {
  Alert,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useFocusEffect } from 'expo-router';

import { api } from '../../api';
import { User } from '../../api/types';
import { getCurrentUser, loginWithEmail, logout, subscribe as subscribeAuth, setUser } from '../../state/auth';
import { getWishlist, subscribe as subscribeWishlist } from '../../state/wishlist';
import AdminMyPage from '../../screens/admin/AdminMyPage';

const INTEREST_OPTIONS = ['음악', '미술', '음식', '전통/문화', '계절', '이벤트', '지속가능성']; // 변경됨

export default function MyScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const [isNotiEnabled, setIsNotiEnabled] = useState(true);
  const [stats, setStats] = useState({ bookings: 0, reviews: 0, wishlist: 0 });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);

  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      setUserInfo(user);
      setIsLoggedIn(!!user);
    });
    const current = getCurrentUser();
    setUserInfo(current);
    setIsLoggedIn(!!current);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeWishlist((list) => {
      setStats((prev) => ({ ...prev, wishlist: list.length }));
    });
    setStats((prev) => ({ ...prev, wishlist: getWishlist().length }));
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      if (!userInfo) return;
      try {
        const [bookingCount, reviewsByUser] = await Promise.all([
          api.getReservationCount(userInfo.userId),
          api.getReviewsByUser(userInfo.userId),
        ]);
        setStats((prev) => ({ ...prev, bookings: bookingCount, reviews: reviewsByUser.length }));
      } catch (e) {
        console.error(e);
      }
    };
    loadCounts();
  }, [userInfo]);

  useFocusEffect(
    React.useCallback(() => {
      const refresh = async () => {
        if (!userInfo) return;
        try {
          const [bookingCount, reviewsByUser] = await Promise.all([
            api.getReservationCount(userInfo.userId),
            api.getReviewsByUser(userInfo.userId),
          ]);
          setStats((prev) => ({ ...prev, bookings: bookingCount, reviews: reviewsByUser.length }));
        } catch (e) {
          console.error(e);
        }
      };
      refresh();
    }, [userInfo])
  );

  const handleLogin = async () => {
    try {
      const user = await loginWithEmail(inputEmail.trim(), inputPassword);
      setInputEmail('');
      setInputPassword('');
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인하세요.'); // 변경됨
      } else {
        Alert.alert('오류', e?.message || '로그인 중 문제가 발생했습니다.');
      }
    }
  };

  const openEditModal = () => {
    if (!userInfo) return;
    setEditName(userInfo.name);
    setEditInterests(userInfo.interests || []);
    setEditModalVisible(true);
  };

  const handleEditInterest = (interest: string) => {
    if (editInterests.includes(interest)) {
      setEditInterests((prev) => prev.filter((i) => i !== interest));
    } else {
      if (editInterests.length < 2) {
        setEditInterests((prev) => [...prev, interest]);
      } else {
        Alert.alert('알림', '관심사는 최대 2개까지 가능합니다.');
      }
    }
  };

  const saveUserInfo = async () => {
    if (!userInfo) return;
    if (!editName) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }
    try {
      const updated = await api.updateUser(userInfo.userId, {
        name: editName,
        interests: editInterests,
      });
      setUser(updated);
      setEditModalVisible(false);
      Alert.alert('완료', '정보가 수정되었습니다.');
    } catch (e: any) {
      Alert.alert('오류', e?.message || '정보 수정 중 문제가 발생했습니다.');
    }
  };

  const isAdmin = userInfo?.admin === 1;

  if (isLoggedIn && userInfo && isAdmin) {
    return <AdminMyPage user={userInfo} onLogout={logout} />;
  }

  if (isLoggedIn && userInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>마이 페이지</Text>
            <Pressable onPress={logout}>
              <Text style={styles.logoutLink}>로그아웃</Text>
            </Pressable>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userInfo.name?.[0] || 'U'}</Text>
              </View>

              <View style={styles.profileTexts}>
                <Text style={styles.userName}>{userInfo.name}</Text>
                <Text style={styles.userEmail}>{userInfo.email}</Text>
                <Pressable style={styles.smallEditButton} onPress={openEditModal}>
                  <Text style={styles.smallEditText}>정보 수정</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.statsContainer}>
            <Pressable style={styles.statItem} onPress={() => router.push('/mypage/reservations')}>
              <Text style={styles.statNumber}>{stats.bookings}</Text>
              <Text style={styles.statLabel}>예약</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => router.push('/mypage/reviews')}>
              <Text style={styles.statNumber}>{stats.reviews}</Text>
              <Text style={styles.statLabel}>리뷰</Text>
            </Pressable>
            <View style={styles.statDivider} />
              <Pressable style={styles.statItem} onPress={() => router.push('/my/wishlist')}>
                <Text style={styles.statNumber}>{stats.wishlist}</Text>
                <Text style={styles.statLabel}>찜</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>내 활동</Text>

            <Pressable style={styles.menuItem} onPress={() => router.push('/mypage/reservations')}>
              <IconSymbol name="ticket.fill" size={20} color="#007AFF" />
              <Text style={styles.menuText}>나의 예약 이력</Text>
              <IconSymbol name="chevron.right" size={16} color="#ccc" />
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => router.push('/mypage/reviews')}>
              <IconSymbol name="text.bubble.fill" size={20} color="#007AFF" />
              <Text style={styles.menuText}>나의 리뷰 관리</Text>
              <IconSymbol name="chevron.right" size={16} color="#ccc" />
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => router.push('/my/wishlist')}>
              <IconSymbol name="heart.fill" size={20} color="#FF3B30" />
              <Text style={styles.menuText}>찜한 축제</Text>
              <IconSymbol name="chevron.right" size={16} color="#ccc" />
            </Pressable>
          </View>

          <View style={[styles.menuSection, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>설정</Text>
            <View style={styles.menuItem}>
              <IconSymbol name="bell.fill" size={20} color="#333" />
              <Text style={styles.menuText}>알림 설정</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={'#f4f3f4'}
                value={isNotiEnabled}
                onValueChange={() => setIsNotiEnabled((prev) => !prev)}
              />
            </View>

            <View style={styles.menuItem}>
              <IconSymbol name="info.circle.fill" size={20} color="#333" />
              <Text style={styles.menuText}>앱 버전</Text>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
        </ScrollView>

        <Modal visible={editModalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>정보 수정</Text>

              <Text style={styles.label}>이름</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} />

              <Text style={styles.label}>관심사</Text>
              <View style={styles.interestContainer}>
                {INTEREST_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    style={[styles.interestChip, editInterests.includes(option) && styles.interestChipSelected]}
                    onPress={() => handleEditInterest(option)}
                  >
                    <Text
                      style={[styles.interestText, editInterests.includes(option) && styles.interestTextSelected]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelText}>취소</Text>
                </Pressable>
                <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={saveUserInfo}>
                  <Text style={styles.saveText}>저장</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>My Page</Text>
          <Text style={styles.subTitle}>로그인하고 축제를 즐겨보세요</Text>

          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={inputEmail}
            onChangeText={setInputEmail}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            secureTextEntry
            value={inputPassword}
            onChangeText={setInputPassword}
          />

          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </Pressable>

          <View style={styles.separator} />

          <Link href="/signup" asChild>
            <Pressable style={styles.signupLinkButton}>
              <Text style={styles.signupLinkText}>계정이 없으신가요? 회원가입</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  loginContainer: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subTitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, marginLeft: 4 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },
  loginButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 30 },
  signupLinkButton: { padding: 15, alignItems: 'center' },
  signupLinkText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },

  scrollContainer: { padding: 20, paddingBottom: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontSize: 26, fontWeight: 'bold' },
  logoutLink: { fontSize: 14, color: '#FF3B30', fontWeight: '600' },

  profileCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  profileTexts: { flex: 1 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#888', marginBottom: 4 },
  smallEditButton: { backgroundColor: '#F0F0F0', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 15, alignSelf: 'flex-start' },
  smallEditText: { fontSize: 12, color: '#555', fontWeight: '600' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15 },
  statItem: { alignItems: 'center', padding: 5 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  statDivider: { width: 1, height: '80%', backgroundColor: '#f0f0f0' },

  menuSection: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 5, overflow: 'hidden' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginLeft: 15, marginTop: 15, marginBottom: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 12 },
  versionText: { fontSize: 14, color: '#999' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelBtn: { backgroundColor: '#eee' },
  saveBtn: { backgroundColor: '#007AFF' },
  cancelText: { color: '#333', fontWeight: 'bold' },
  saveText: { color: '#fff', fontWeight: 'bold' },

  interestContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  interestChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  interestChipSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  interestText: { fontSize: 13, color: '#555' },
  interestTextSelected: { color: '#fff', fontWeight: 'bold' },
});
