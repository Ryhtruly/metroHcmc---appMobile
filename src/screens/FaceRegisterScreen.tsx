import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import axiosClient, { ApiResponse } from "../api/axiosClient";

export default function FaceRegisterScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);

  const handleRegisterBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác nhận để kích hoạt đăng nhập nhanh",
      });

      if (result.success) {
        setLoading(true);
        // 1. Tạo mã định danh duy nhất cho máy này
        const newToken =
          Math.random().toString(36).substring(2) + Date.now().toString(36);

        // 2. Ghi dữ liệu xuống Database thông qua API
        const res = await axiosClient.post<any, ApiResponse>(
          "/auth/enable-biometric",
          {
            biometricToken: newToken,
          }
        );

        if (res.success) {
          // 3. Lưu mã này vào bộ nhớ an toàn của máy
          await SecureStore.setItemAsync("biometric_token", newToken);
          Alert.alert(
            "Thành công",
            "Tính năng đăng nhập nhanh đã được kích hoạt!",
            [{ text: "Xong", onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
            "Lỗi",
            res.message || "Không thể lưu thông tin vào hệ thống."
          );
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra trong quá trình đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark-outline" size={100} color="#28a745" />
      <Text style={styles.title}>Bảo mật Sinh trắc học</Text>
      <Text style={styles.desc}>
        Kích hoạt FaceID hoặc Vân tay để đăng nhập nhanh chóng mà không cần nhập
        mật khẩu.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={handleRegisterBiometric}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>BẮT ĐẦU THIẾT LẬP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: "#666" }}>Để sau</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 20 },
  desc: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 22,
  },
  btn: {
    backgroundColor: "#28a745",
    width: "100%",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 40,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
