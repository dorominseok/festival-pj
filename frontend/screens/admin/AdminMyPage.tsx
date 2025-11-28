import React from 'react';
import { Pressable, StyleSheet, Text, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User } from '../../api/types';

type Props = {
  user: User;
  onLogout?: () => void;
};

const AdminMyPage: React.FC<Props> = ({ user, onLogout }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>관리자 페이지</Text>
        {onLogout && (
          <Pressable onPress={onLogout}>
            <Text style={styles.logoutLink}>로그아웃</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user.name?.[0] || 'A'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.roleBadge}>Admin</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>관리 도구</Text>
        <MenuItem label="축제 관리" onPress={() => router.push('/admin/festivals')} />
        <MenuItem label="액티비티 관리" onPress={() => router.push('/admin/activity')} />
        <MenuItem label="리뷰 전체보기" onPress={() => router.push('/admin/reviews')} />
      </View>

      <View style={[styles.menuSection, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>설정</Text>
        <View style={[styles.menuItem, styles.noBorder]}>
          <Text style={styles.menuText}>알림 설정</Text>
          <Switch value />
        </View>
        <View style={[styles.menuItem, styles.noBorder]}>
          <Text style={styles.menuText}>앱 버전</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const MenuItem = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuText}>{label}</Text>
    <Text style={styles.chevron}>{'>'}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: 26, fontWeight: 'bold' },
  logoutLink: { color: '#FF3B30', fontWeight: '600' },
  profileCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 2 },
  roleBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFE8D5',
    color: '#C75C00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '700',
  },
  menuSection: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  sectionTitle: { fontSize: 14, color: '#666', fontWeight: '700', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
  },
  noBorder: { borderTopWidth: 0 },
  menuText: { flex: 1, fontSize: 16, color: '#333' },
  chevron: { color: '#bbb', fontSize: 16 },
  versionText: { color: '#999', fontSize: 14 },
});

export default AdminMyPage;
