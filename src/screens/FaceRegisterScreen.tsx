import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

// 👇 DÙNG CHUẨN MỚI NHẤT (Không legacy, không lỗi import)
import { CameraView, useCameraPermissions } from 'expo-camera'; 

import * as ImageManipulator from 'expo-image-manipulator';
import axiosClient from '../api/axiosClient';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function FaceRegisterScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [images, setImages] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  // Hàm chụp ảnh (Thủ công)
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

        // Lưu ảnh vào mảng
        const newImages = [...images, manipResult];
        setImages(newImages);

        if (newImages.length < 3) {
          Alert.alert("Đã chụp", `Được ${newImages.length}/3 ảnh. Hãy xoay mặt và chụp tiếp!`);
          setLoading(false);
        } else {
          // Đủ 3 ảnh -> Gửi
          uploadImages(newImages);
        }

      } catch (error) {
        Alert.alert('Lỗi', 'Không chụp được ảnh');
        setLoading(false);
      }
    }
  };

  const uploadImages = async (finalImages: any[]) => {
    try {
      const userInfoStr = await SecureStore.getItemAsync('user_info');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      if (!userInfo) return;

      const formData = new FormData();
      formData.append('user_id', userInfo.user_id);

      finalImages.forEach((img, index) => {
        // @ts-ignore
        formData.append('face_images', {
          uri: img.uri, type: 'image/jpeg', name: `face_${index}.jpg`
        });
      });

      const res: any = await axiosClient.post('/auth/register-face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        Alert.alert('Thành công', 'Đăng ký hoàn tất!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Lỗi', res.message);
        setImages([]); 
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white', textAlign: 'center'}}>Cần quyền Camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>Cấp quyền</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 👇 DÙNG CAMERAVIEW (Chuẩn mới) */}
      <CameraView 
        style={styles.camera} 
        facing="front"
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <View style={styles.faceFrame} />
          
          <View style={styles.instructionBox}>
            <Text style={styles.bigText}>
              {images.length === 0 ? "Nhìn Thẳng" : images.length === 1 ? "Quay Trái" : "Quay Phải"}
            </Text>
            <Text style={styles.smallText}>
              {images.length}/3 Ảnh - Bấm nút để chụp
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#00ff00" style={{ marginBottom: 40 }} />
          ) : (
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  faceFrame: { position: 'absolute', top: '20%', width: 280, height: 280, borderRadius: 140, borderWidth: 4, borderColor: '#fff' },
  instructionBox: { position: 'absolute', top: '60%', alignItems: 'center' },
  bigText: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  smallText: { fontSize: 16, color: '#eee' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  captureInner: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#000' },
  closeBtn: { position: 'absolute', top: 50, right: 20 },
  btn: { padding: 10, backgroundColor: 'white' }
});