import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api';
import { setUser } from '../state/auth';

const INTEREST_OPTIONS = ['음악', '미술', '음식', '전통/문화', '계절', '이벤트', '자연'];

export default function SignUpScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSelectInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests((prev) => prev.filter((item) => item !== interest));
    } else {
      if (selectedInterests.length < 2) {
        setSelectedInterests((prev) => [...prev, interest]);
      } else {
        Alert.alert('선택 제한', '관심사는 최대 2개까지 선택 가능합니다.');
      }
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('입력 오류', '모든 정보를 입력해주세요.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('입력 오류', '유효한 이메일 형식이 아닙니다.');
      return;
    }

    try {
      const user = await api.signup({
        name,
        email,
        password,
        interests: selectedInterests,
      });
      setUser(user);
      Alert.alert('가입 완료', '회원가입이 완료되었습니다.', [
        { text: '확인', onPress: () => router.replace('/my') },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e?.message || '회원가입 중 문제가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.title}>Create New Account</Text>
            <Text style={styles.subtitle}>회원가입을 위해 정보를 입력해주세요.</Text>

            <Text style={styles.label}>NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="이름을 입력하세요"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>E-MAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>관심사 (최대 2개)</Text>
            <Pressable style={styles.selectButton} onPress={() => setIsModalVisible(true)}>
              <Text style={styles.selectButtonText}>
                {selectedInterests.length > 0 ? selectedInterests.join(', ') : '관심사를 선택해주세요'}
              </Text>
            </Pressable>

            <Pressable style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>

        <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
          <View style={styles.modalBackdropBottom}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>관심사 선택</Text>
              <View style={styles.interestList}>
                {INTEREST_OPTIONS.map((item) => (
                  <Pressable
                    key={item}
                    style={[styles.interestButton, selectedInterests.includes(item) && styles.interestButtonSelected]}
                    onPress={() => handleSelectInterest(item)}
                  >
                    <Text
                      style={[
                        styles.interestButtonText,
                        selectedInterests.includes(item) && styles.interestButtonTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>선택 완료</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 50 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  label: { fontSize: 14, color: '#555', marginBottom: 5, marginTop: 15 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: { backgroundColor: '#007AFF', paddingVertical: 18, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  selectButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  selectButtonText: { fontSize: 16, color: '#333' },
  modalBackdropBottom: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 30, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  interestList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  interestButton: { paddingVertical: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, margin: 5 },
  interestButtonSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  interestButtonText: { fontSize: 16, color: '#333' },
  interestButtonTextSelected: { color: '#fff' },
  closeButton: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
});
