import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import axiosClient from '../api/axiosClient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }: any) => {
  // Đổi default sang tài khoản Customer để bạn đỡ phải gõ lại khi test
  const [email, setEmail] = useState('customer@metro.local');
  const [password, setPassword] = useState('customer123');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      console.log('Đang gọi API login...');
      const res: any = await axiosClient.post('auth/login', { email, password });

      if (res.success) {
        const { role } = res.user;

        // --- ⛔ PHÂN QUYỀN: CHẶN ADMIN ⛔ ---
        if (role === 'ADMIN') {
          Alert.alert(
            'Truy cập bị từ chối',
            'Tài khoản ADMIN chỉ được phép sử dụng trên trang Web Quản trị.\nVui lòng sử dụng tài khoản Khách hàng.'
          );
          setLoading(false);
          return; // Dừng ngay lập tức, không lưu token, không chuyển trang
        }
        // ------------------------------------

        // Nếu là Customer hoặc Inspector thì cho qua
        await SecureStore.setItemAsync('auth_token', res.token);
        await SecureStore.setItemAsync('user_info', JSON.stringify(res.user));

        Alert.alert('Thành công', `Xin chào ${res.user.display_name}!`);

        navigation.replace('Home');
      } else {
        Alert.alert('Đăng nhập thất bại', 'Tài khoản hoặc mật khẩu không đúng');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server.\nHãy kiểm tra lại IP máy tính.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* --- PHẦN LOGO --- */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="train-outline" size={50} color="#003eb3" />
          </View>
          <Text style={styles.appName}>METRO CONNECT</Text>
          <Text style={styles.appSlogan}>Hệ thống vé tàu điện tử</Text>
        </View>

        {/* --- PHẦN FORM --- */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Đăng nhập</Text>
          <Text style={styles.subText}>Dành cho Hành khách & Nhân viên</Text>

          {/* Input Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Input Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={{ color: '#0056b3', fontSize: 13, fontWeight: '500' }}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>ĐĂNG NHẬP</Text>
            )}
          </TouchableOpacity>

        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text>Đăng ký tài khoản</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#003eb3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#003eb3', letterSpacing: 1 },
  appSlogan: { fontSize: 16, color: '#666', marginTop: 4 },
  formContainer: {
    backgroundColor: '#fff', padding: 24, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3
  },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subText: { fontSize: 14, color: '#888', marginBottom: 24 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9f9f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#eee'
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  forgotPassBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPassText: { color: '#003eb3', fontWeight: '600' },
  loginBtn: {
    backgroundColor: '#003eb3', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#003eb3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#666', fontSize: 14 },
  signupText: { color: '#003eb3', fontWeight: 'bold', fontSize: 14 },
});

export default LoginScreen;