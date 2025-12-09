import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Chuẩn mới
import * as ImageManipulator from 'expo-image-manipulator';
import axiosClient from '../api/axiosClient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function FaceLoginScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !loading) {
      setLoading(true);
      try {
        const photoData = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
        
        const manipResult = await ImageManipulator.manipulateAsync(
          photoData.uri,
          [{ resize: { width: 600 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        await handleFaceLogin(manipResult.uri);

      } catch (error) {
        setLoading(false);
      }
    }
  };

  const handleFaceLogin = async (uri: string) => {
    try {
      const emailToLogin = "customer@metro.local"; // Sửa lại email của bạn

      const formData = new FormData();
      formData.append('email', emailToLogin);
      // @ts-ignore
      formData.append('face_image', { uri: uri, type: 'image/jpeg', name: 'face_login.jpg' });

      const res: any = await axiosClient.post('/auth/login-face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        await SecureStore.setItemAsync('user_info', JSON.stringify(res.user));
        Alert.alert('Thành công', `Xin chào ${res.user.display_name}`, [
            { text: 'Vào nhà', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('Thất bại', 'Không đúng người. Thử lại nhé!');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Lỗi Server');
    } finally {
      setLoading(false);
    }
  };

  if (!permission?.granted) return <View />;

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="front"
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <View style={styles.faceFrame} />
          <Text style={styles.instructionText}>Bấm nút để đăng nhập</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#00ff00" style={{ marginBottom: 40 }} />
          ) : (
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          )}
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
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  faceFrame: { position: 'absolute', top: '20%', width: 280, height: 280, borderWidth: 4, borderColor: '#00ff00', borderRadius: 140 },
  instructionText: { position: 'absolute', top: '65%', color: '#fff', fontSize: 18, fontWeight: 'bold' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  captureInner: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#000' },
  backBtn: { position: 'absolute', top: 50, right: 20 }
});