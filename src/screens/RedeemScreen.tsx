import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, ActivityIndicator, Alert, Keyboard 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axiosClient from '../api/axiosClient'; 

const RedeemScreen = () => {
  // Fix lỗi TypeScript navigate
  const navigation = useNavigation<any>(); 
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã vé.');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      // Gọi API
      const res: any = await axiosClient.post('/promo/redeem', { 
        code: code.trim() 
      });

      console.log("Kết quả server trả về:", res); 

      // 👇 SỬA LỖI Ở ĐÂY: 
      // Server trả về thẳng object { ok: true, message: ... }
      // KHÔNG ĐƯỢC dùng res.data.ok mà phải dùng res.ok
      if (res && res.ok) {
        Alert.alert(
          'Thành công 🎉', 
          res.message || 'Đổi mã thành công! Vé đã được thêm vào ví.',
          [
            { text: 'Đóng', style: 'cancel' }
          ]
        );
        setCode(''); 
      } else {
        // Lấy message lỗi trực tiếp từ res
        Alert.alert('Thất bại', res?.message || 'Mã không hợp lệ.');
      }

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Lỗi kết nối Server.';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mã lấy vé</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Mã vé <Text style={{color:'#d9534f'}}>*</Text></Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã vé"
            placeholderTextColor="#999"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
          <MaterialCommunityIcons name="qrcode" size={24} color="#0056b3" style={{ opacity: 0.7 }} />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRedeem}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kiểm tra</Text>
          )}
        </TouchableOpacity>

        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>Lưu ý:</Text>
          <View style={styles.noteItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.noteText}>Vé sau khi được đổi sẽ được lưu vào tài khoản đang đăng nhập trên ứng dụng.</Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.noteText}>Mỗi mã đặt vé chỉ được sử dụng đổi vé 01 lần.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, backgroundColor: '#fff', elevation: 2 },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366' },
  content: { padding: 20, marginTop: 10 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#333' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, height: 50, paddingHorizontal: 12, marginBottom: 24 },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#333' },
  button: { backgroundColor: '#0056b3', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  buttonDisabled: { backgroundColor: '#8cbae6' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  noteContainer: { marginTop: 32 },
  noteTitle: { fontSize: 15, color: '#555', marginBottom: 10, fontWeight: '500' },
  noteItem: { flexDirection: 'row', marginBottom: 8, paddingRight: 10 },
  bullet: { fontSize: 14, color: '#666', marginRight: 8, lineHeight: 20 },
  noteText: { fontSize: 14, color: '#666', lineHeight: 20, flex: 1 }
});

export default RedeemScreen;