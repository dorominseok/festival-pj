// app/_layout.tsx
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 메인 탭 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 회원가입 */}
        <Stack.Screen name="signup" options={{ presentation: 'modal', title: '회원가입' }} />

        {/* 액티비티 예약 상세 */}
        <Stack.Screen
          name="activity-detail"
          options={{ title: '액티비티 예약', headerShown: true, headerBackTitle: '뒤로' }}
        />

        {/* 축제 상세 + 리뷰 작성 */}
        <Stack.Screen
          name="festival-detail"
          options={{ title: '축제 상세', headerShown: true, headerBackTitle: '뒤로' }}
        />
        <Stack.Screen
          name="review-write"
          options={{ title: '리뷰 작성', headerShown: true, headerBackTitle: '뒤로' }}
        />

        {/* 마이페이지 하위 화면 */}
        <Stack.Screen name="my/bookings" options={{ title: '나의 예약', headerShown: true, headerBackTitle: 'MY' }} />
        <Stack.Screen name="my/reviews" options={{ title: '나의 리뷰', headerShown: true, headerBackTitle: 'MY' }} />
        <Stack.Screen name="my/wishlist" options={{ title: '찜한 축제', headerShown: true, headerBackTitle: 'MY' }} />
        <Stack.Screen name="mypage/reservations" options={{ title: '나의 예약 이력', headerShown: true, headerBackTitle: 'MY' }} />
        <Stack.Screen name="mypage/reviews" options={{ title: '나의 리뷰 관리', headerShown: true, headerBackTitle: 'MY' }} />
        <Stack.Screen name="reservation/[id]" options={{ title: '예약 상세', headerShown: true, headerBackTitle: '뒤로' }} />

        {/* 관리자 */}
        <Stack.Screen name="admin/festivals" options={{ title: '축제 관리', headerShown: true }} />
        <Stack.Screen name="admin/create-festival" options={{ title: '축제 등록', headerShown: true }} />
        <Stack.Screen name="admin/edit-festival" options={{ title: '축제 수정', headerShown: true }} />
        <Stack.Screen name="admin/reviews" options={{ title: '리뷰 전체보기', headerShown: true }} />
        <Stack.Screen name="admin/activity" options={{ title: '액티비티 관리', headerShown: true }} />
        <Stack.Screen name="admin/create-activity" options={{ title: '액티비티 등록', headerShown: true }} />
        <Stack.Screen name="admin/edit-activity" options={{ title: '액티비티 수정', headerShown: true }} />

        {/* 모달 */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
