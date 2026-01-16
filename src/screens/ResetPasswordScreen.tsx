import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';

const ResetPasswordScreen = ({ route, navigation }: any) => {
  // Nhận token giả lập từ màn hình trước (để test cho dễ)
  const { email, simulatedToken } = route.params || {};

  const [token, setToken] = useState(simulatedToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleReset = async () => {
    if (!token || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      // Gọi API reset pass của Webservice
      const res: any = await axiosClient.post('/auth/reset-password', {
        token: token,
        new_password: newPassword
      });

      if (res.success) {
        Alert.alert('Thành công', 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.', [
          { text: 'Đăng nhập ngay', onPress: () => navigation.popToTop() } // Về màn Login
        ]);
      } else {
        Alert.alert('Thất bại', res.message || 'Mã OTP không đúng hoặc đã hết hạn');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối Server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0056b3', '#008DDA']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>Nhập mã OTP đã gửi tới {email}</Text>

          <View style={styles.card}>
            {/* Input OTP */}
            <Text style={styles.label}>Mã OTP (Token)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#666" style={{marginRight: 10}} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mã 6 số"
                value={token}
                onChangeText={setToken}
                keyboardType="numeric"
              />
            </View>

            {/* Input Mật khẩu mới */}
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={{marginRight: 10}} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? "eye-outline" : "eye-off-outline"} size={20} color="#666"/>
              </TouchableOpacity>
            </View>

            {/* Input Xác nhận */}
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#666" style={{marginRight: 10}} />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPass}
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleReset} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>ĐỔI MẬT KHẨU</Text>}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, flexGrow: 1 },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 30 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
  label: { fontWeight: '600', marginBottom: 8, color: '#333' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', borderRadius: 10, paddingHorizontal: 15, height: 50, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  input: { flex: 1, fontSize: 16 },
  btn: { backgroundColor: '#003eb3', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ResetPasswordScreen;