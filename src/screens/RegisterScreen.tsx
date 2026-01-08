import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../api/axiosClient";
import DateTimePicker from "@react-native-community/datetimepicker";

const RegisterScreen = ({ navigation }: any) => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [cccd, setCccd] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    if (!displayName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return false;
    }
    // check email đơn giản
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return false;
    }
    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Nhập lại mật khẩu không khớp");
      return false;
    }
    // Validate số điện thoại nếu có
    if (phoneNumber && !/^\d{10,11}$/.test(phoneNumber.trim())) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return false;
    }
    // Validate CCCD nếu có
    if (cccd && !/^\d{9,12}$/.test(cccd.trim())) {
      Alert.alert("Lỗi", "CCCD phải có 9-12 chữ số");
      return false;
    }
    // Validate ngày sinh nếu có
    if (birthDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        Alert.alert("Lỗi", "Ngày sinh phải có định dạng YYYY-MM-DD");
        return false;
      }
      const inputDate = new Date(birthDate);
      const today = new Date();
      if (inputDate > today) {
        Alert.alert("Lỗi", "Ngày sinh không được lớn hơn ngày hiện tại");
        return false;
      }
    }
    return true;
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      if (Platform.OS === "android") {
        // Android chọn xong tự đóng và set giá trị luôn
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;
        setBirthDate(formattedDate);
      }
    }
  };

  const confirmIOSDate = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    setBirthDate(formattedDate);
    setShowDatePicker(false);
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const registerData: any = {
        email: email.trim(),
        password,
        display_name: displayName.trim(),
      };

      // Chỉ thêm các trường không rỗng
      if (phoneNumber.trim()) {
        registerData.phone_number = phoneNumber.trim();
      }
      if (address.trim()) {
        registerData.address = address.trim();
      }
      if (cccd.trim()) {
        registerData.cccd = cccd.trim();
      }
      if (birthDate) {
        registerData.birth_date = birthDate;
      }

      console.log("Register data:", registerData);

      const res: any = await axiosClient.post("/auth/register", registerData);

      if (res.success) {
        Alert.alert("Thành công", "Đăng ký thành công, vui lòng đăng nhập", [
          {
            text: "OK",
            onPress: () => navigation.goBack(), // quay lại màn Login
          },
        ]);
      } else {
        Alert.alert("Lỗi", res.message || "Không thể đăng ký tài khoản");
      }
    } catch (error: any) {
      console.log("Lỗi đăng ký:", error?.response || error);
      if (error.response?.data) {
        Alert.alert(
          "Lỗi",
          error.response.data.message || "Có lỗi xảy ra khi đăng ký tài khoản"
        );
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng ký tài khoản");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0056b3", "#008DDA"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>
              Đăng ký để sử dụng Metro Connect
            </Text>
          </View>

          {/* Form white card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

            {/* Họ và tên */}
            <Text style={styles.label}>Họ và tên *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nhập họ và tên"
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nhập email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Mật khẩu */}
            <Text style={styles.label}>Mật khẩu *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 5 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Nhập lại mật khẩu */}
            <Text style={styles.label}>Nhập lại mật khẩu *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ padding: 5 }}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Số điện thoại */}
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.inputHint}>Ví dụ: 0901234567</Text>

            {/* Địa chỉ */}
            <Text style={styles.label}>Địa chỉ</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="home-outline"
                size={18}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nhập địa chỉ"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* CCCD */}
            <Text style={styles.label}>CCCD/CMND</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="id-card-outline"
                size={18}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nhập số CCCD/CMND"
                value={cccd}
                onChangeText={setCccd}
                style={styles.input}
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.inputHint}>9-12 chữ số</Text>

            {/* Ngày sinh */}
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#64748b"
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.input,
                  {
                    color: birthDate ? "#0f172a" : "#94a3b8",
                    paddingVertical: 12,
                  },
                ]}
              >
                {birthDate || "YYYY-MM-DD (nhấn để chọn ngày)"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.inputHint}>Định dạng: Năm-Tháng-Ngày</Text>

            {/* Nút Đăng ký */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            {/* Thông báo các trường bắt buộc */}
            <Text style={styles.requiredHint}>* Các trường bắt buộc</Text>

            {/* Link chuyển sang Đăng nhập */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Logic */}
      {Platform.OS === "ios" ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.iosModalContainer}>
            <View style={styles.iosModalContent}>
              <View style={styles.iosModalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: "#666", fontSize: 16 }}>Hủy</Text>
                </TouchableOpacity>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  Chọn ngày sinh
                </Text>
                <TouchableOpacity onPress={confirmIOSDate}>
                  <Text
                    style={{
                      color: "#007AFF",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Xong
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                locale="vi-VN"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backBtn: {
    marginBottom: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginTop: 10,
    marginBottom: 15,
    textTransform: "uppercase",
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 10,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0f172a",
  },
  inputHint: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    marginLeft: 4,
    fontStyle: "italic",
  },
  requiredHint: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#0056b3",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  footerText: {
    fontSize: 13,
    color: "#6b7280",
  },
  footerLink: {
    fontSize: 13,
    color: "#0056b3",
    fontWeight: "600",
    marginLeft: 4,
  },
  // iOS DatePicker Modal Styles
  iosModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  iosModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  iosModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
});

export default RegisterScreen;
