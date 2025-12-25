import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import * as ImageManipulator from 'expo-image-manipulator';
import axiosClient from '../api/axiosClient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function FaceLoginScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<any>(null);

  // Vòng lặp Auto-Scan
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const autoCapture = async () => {
      if (!cameraRef.current || isProcessing) return;

      try {
        // 1. Chụp thử
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.3, skipProcessing: true });
        
        // 2. Soi xem có mặt không
        const result = await FaceDetector.detectFacesAsync(photo.uri, {
            mode: FaceDetector.FaceDetectorMode.fast,
            detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        });

        // 3. Nếu có mặt -> Gửi đi đăng nhập ngay
        if (result.faces.length > 0) {
            setIsProcessing(true); // Dừng scan
            console.log("Phát hiện khuôn mặt! Đang đăng nhập...");
            
            // Resize ảnh cho nhẹ trước khi gửi
            const finalPhoto = await ImageManipulator.manipulateAsync(
                photo.uri, [{ resize: { width: 600 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            
            await handleLogin(finalPhoto.uri);
        }
      } catch (e) {
        console.log("Scan error (ignore):", e);
      }
    };

    if (permission?.granted && !isProcessing) {
      interval = setInterval(autoCapture, 1000); // 1 giây check 1 lần cho đỡ lag
    }

    return () => clearInterval(interval);
  }, [permission, isProcessing]);

  const handleLogin = async (uri: string) => {
    try {
      const emailToLogin = "customer@metro.local"; // Sửa lại đúng logic lấy email của bạn

      const formData = new FormData();
      formData.append('email', emailToLogin);
      // @ts-ignore
      formData.append('face_image', { uri: uri, type: 'image/jpeg', name: 'login.jpg' });

      const res: any = await axiosClient.post('/auth/login-face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        await SecureStore.setItemAsync('user_info', JSON.stringify(res.user));
        Alert.alert('Xin chào', res.user.display_name, [
            { text: 'Vào trang chủ', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('Thất bại', 'Không nhận diện được', [
            { text: 'Thử lại', onPress: () => setIsProcessing(false) } // Cho phép scan lại
        ]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Server Error', [{ text: 'Thử lại', onPress: () => setIsProcessing(false) }]);
    }
  };

  if (!permission?.granted) return <View />;

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="front" ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={[styles.faceFrame, { borderColor: isProcessing ? '#00ff00' : 'white' }]} />
          <Text style={styles.statusText}>
            {isProcessing ? "Đang xác thực..." : "Đang tìm khuôn mặt..."}
          </Text>
          {isProcessing && <ActivityIndicator size="large" color="#00ff00" style={{marginTop: 20}} />}
        </View>
      </CameraView>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="close-circle" size={50} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  faceFrame: { width: 280, height: 280, borderWidth: 3, borderRadius: 140, marginBottom: 20 },
  statusText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  backBtn: { position: 'absolute', bottom: 40, alignSelf: 'center' }
});