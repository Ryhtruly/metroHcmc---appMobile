import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';

const FeedbackScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung góp ý");
      return;
    }

    setLoading(true);
    try {
      const res: any = await axiosClient.post('/support/feedback', {
        title: title || 'Góp ý từ App',
        content: content
      });

      if (res.success) {
        Alert.alert("Cảm ơn!", "Chúng tôi đã nhận được phản hồi của bạn.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Lỗi", res.message);
      }
    } catch (error) {
      Alert.alert("Lỗi kết nối", "Không thể gửi phản hồi lúc này.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#003eb3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gửi phản hồi</Text>
        <View style={{width: 24}} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, padding: 20 }}
      >
        <Text style={styles.label}>Tiêu đề (Tùy chọn)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ví dụ: Lỗi thanh toán, Đề xuất tính năng..."
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Nội dung (*)</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Nhập nội dung góp ý của bạn..."
          value={content}
          onChangeText={setContent}
          multiline={true}
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={styles.btnSend} 
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>GỬI PHẢN HỒI</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#003eb3' },
  
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  textArea: { height: 150 },
  
  btnSend: { backgroundColor: '#003eb3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default FeedbackScreen;