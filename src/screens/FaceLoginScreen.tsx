import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient, { ApiResponse } from '../api/axiosClient';

export default function FaceLoginScreen({ navigation }: any) {
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔥 Tự động quét khi vừa mở màn hình
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => handleBiometricLogin(), 500);
      return () => clearTimeout(timer);
    }, [])
  );

 const handleBiometricLogin = async () => {
  try {
    setIsProcessing(true);

    // Gọi trình quét hệ thống
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Xác thực khuôn mặt để vào Metro', // Lời nhắc hiện trên iQOO
      fallbackLabel: 'Dùng mật khẩu',
      
      // 🔥 DÀNH CHO ANDROID (iQOO):
      // Tắt xác nhận giúp máy quét mặt xong là "bắn" vào Home ngay
      requireConfirmation: false, 
      
      // Cho phép dùng vân tay nếu camera không thấy mặt (để tránh treo app)
      disableDeviceFallback: false,
    });

    if (result.success) {
      const savedToken = await SecureStore.getItemAsync('biometric_token');
      
      if (savedToken) {
        // Gọi API Login Biometric
        const res = await axiosClient.post<any, ApiResponse>('/auth/login-biometric', { 
          biometricToken: savedToken 
        });

        if (res.success && res.token) {
          await SecureStore.setItemAsync('auth_token', res.token);
          navigation.replace('Home');
        }
      }
    }
  } catch (error) {
    console.log("Lỗi:", error);
  } finally {
    setIsProcessing(false);
  }
};
  return (
    <View style={styles.container}>
      <Ionicons name="scan-circle-outline" size={120} color="#003eb3" />
      <Text style={styles.title}>Đăng nhập nhanh</Text>
      <Text style={styles.subTitle}>Đang nhận diện khuôn mặt...</Text>
      
      {isProcessing && <ActivityIndicator size="large" color="#003eb3" style={{ marginTop: 20 }} />}

      <TouchableOpacity style={styles.btn} onPress={handleBiometricLogin} disabled={isProcessing}>
        <Text style={styles.btnText}>QUÉT LẠI</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{color: '#666', marginTop: 25}}>Dùng mật khẩu truyền thống</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 },
  subTitle: { fontSize: 16, color: '#666', marginTop: 10 },
  btn: { backgroundColor: '#f0f4ff', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, marginTop: 40, borderWidth: 1, borderColor: '#003eb3' },
  btnText: { color: '#003eb3', fontWeight: 'bold' }
});