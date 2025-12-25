import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import * as SecureStore from 'expo-secure-store';

// Định nghĩa các bước thử thách
const STEPS = [
  { 
    id: 'CENTER', 
    text: '😐 Nhìn thẳng', 
    check: (face: any) => {
      // @ts-ignore: Bỏ qua lỗi check type
      return Math.abs(face.yawAngle) < 10 && Math.abs(face.pitchAngle) < 10;
    }
  },
  { 
    id: 'LEFT',   
    text: '⬅️ Quay sang TRÁI', 
    check: (face: any) => {
      // @ts-ignore
      return face.yawAngle > 15;
    }
  },  
  { 
    id: 'RIGHT',  
    text: '➡️ Quay sang PHẢI', 
    check: (face: any) => {
      // @ts-ignore
      return face.yawAngle < -15;
    }
  }, 
  { 
    id: 'UP',     
    text: '⬆️ Ngước lên trên', 
    check: (face: any) => {
      // @ts-ignore
      return face.pitchAngle < -10;
    }
  }, 
];

export default function FaceRegisterScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [stepIndex, setStepIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<any>(null);

  // Vòng lặp quét liên tục
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const scanFace = async () => {
      if (!cameraRef.current || isScanning || stepIndex >= STEPS.length) return;
      
      setIsScanning(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ 
          quality: 0.3, 
          skipProcessing: true, 
          base64: false 
        });

        const result = await FaceDetector.detectFacesAsync(photo.uri, {
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 0,
          tracking: false,
        });

        if (result.faces.length > 0) {
          // 🔥 FIX LỖI Ở ĐÂY: Ép kiểu 'as any' để lấy pitchAngle thoải mái
          const face = result.faces[0] as any; 
          const currentRule = STEPS[stepIndex];

          // Dòng này sẽ hết báo đỏ
          console.log(`Góc mặt: Yaw=${face.yawAngle}, Pitch=${face.pitchAngle}`);

          if (currentRule.check(face)) {
            const goodPhoto = await ImageManipulator.manipulateAsync(
              photo.uri, 
              [{ resize: { width: 600 } }], 
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            setCapturedImages(prev => [...prev, goodPhoto]);
            
            if (stepIndex < STEPS.length - 1) {
              setStepIndex(prev => prev + 1);
            } else {
              handleUpload([...capturedImages, goodPhoto]);
              return;
            }
          }
        }
      } catch (err) {
        console.log("Lỗi scan:", err);
      } finally {
        setTimeout(() => setIsScanning(false), 500); 
      }
    };

    if (permission?.granted && stepIndex < STEPS.length) {
      interval = setInterval(scanFace, 800);
    }

    return () => clearInterval(interval);
  }, [stepIndex, permission, isScanning]);

  const handleUpload = async (finalImages: any[]) => {
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
          Alert.alert('Thành công', 'Đã đăng ký khuôn mặt!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } else {
          Alert.alert('Lỗi', res.message);
          setStepIndex(0); setCapturedImages([]); // Reset làm lại
        }
    } catch (error) {
        Alert.alert('Lỗi', 'Không thể kết nối server');
        setStepIndex(0); setCapturedImages([]);
    }
  };

  if (!permission?.granted) {
    return (
        <View style={styles.center}>
            <Text>Cần quyền Camera</Text>
            <TouchableOpacity onPress={requestPermission}><Text style={{color:'blue'}}>Cấp quyền</Text></TouchableOpacity>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="front" ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Khung mặt */}
          <View style={[styles.faceFrame, { borderColor: stepIndex >= STEPS.length ? '#00ff00' : 'white' }]} />
          
          {/* Hướng dẫn */}
          <View style={styles.instructionBox}>
            <Text style={styles.stepText}>Bước {stepIndex + 1}/4</Text>
            <Text style={styles.actionText}>
                {stepIndex < STEPS.length ? STEPS[stepIndex].text : "✅ Đang xử lý..."}
            </Text>
          </View>
        </View>
      </CameraView>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  faceFrame: { width: 300, height: 400, borderRadius: 150, borderWidth: 4, marginBottom: 50 },
  instructionBox: { position: 'absolute', bottom: 80, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20, borderRadius: 15 },
  stepText: { color: '#bbb', fontSize: 16, marginBottom: 5 },
  actionText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  closeBtn: { position: 'absolute', top: 50, right: 20 }
});