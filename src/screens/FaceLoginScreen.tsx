import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axiosClient, { ApiResponse } from "../api/axiosClient";

export default function FaceLoginScreen({ navigation }: any) {
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔥 Tự động quét khi vừa mở màn hình
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => handleBiometricLogin(), 500);
      return () => clearTimeout(timer);
    }, [])
  );

  // FaceLoginScreen.tsx

  const handleBiometricLogin = async () => {
    try {
      setIsProcessing(true);

      // 1. Kiểm tra xem máy có hỗ trợ phần cứng không
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      // 2. Kiểm tra xem người dùng đã cài FaceID/Vân tay chưa
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Thông báo",
          "Thiết bị chưa thiết lập FaceID/Vân tay hoặc không hỗ trợ."
        );
        setIsProcessing(false);
        return;
      }

      // 3. Gọi trình quét
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác thực khuôn mặt để vào Metro",

        // --- SỬA ĐỔI QUAN TRỌNG Ở ĐÂY ---
        // Đặt là true để KHÔNG hiện mã PIN khi FaceID thất bại
        disableDeviceFallback: true,

        // Nút hủy trên iOS (Bắt buộc nếu disableDeviceFallback = true)
        cancelLabel: "Hủy bỏ",

        // Android specific
        requireConfirmation: false,
      });

      if (result.success) {
        // ... Logic đăng nhập giữ nguyên ...
        const savedToken = await SecureStore.getItemAsync("biometric_token");
        // ...
      } else {
        // Xử lý khi user bấm Hủy hoặc không nhận diện được
        if (result.error !== "user_cancel") {
          Alert.alert("Lỗi", "Không nhận diện được khuôn mặt.");
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

      {isProcessing && (
        <ActivityIndicator
          size="large"
          color="#003eb3"
          style={{ marginTop: 20 }}
        />
      )}

      <TouchableOpacity
        style={styles.btn}
        onPress={handleBiometricLogin}
        disabled={isProcessing}
      >
        <Text style={styles.btnText}>QUÉT LẠI</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: "#666", marginTop: 25 }}>
          Dùng mật khẩu truyền thống
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginTop: 20 },
  subTitle: { fontSize: 16, color: "#666", marginTop: 10 },
  btn: {
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 40,
    borderWidth: 1,
    borderColor: "#003eb3",
  },
  btnText: { color: "#003eb3", fontWeight: "bold" },
});
