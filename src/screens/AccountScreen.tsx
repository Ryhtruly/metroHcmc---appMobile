import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/axiosClient';

const AccountScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Hàm lấy thông tin user mới nhất từ Server
  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Gọi API /auth/me (Đã có middleware tự gắn Token)
      const res: any = await axiosClient.get('/auth/me');
      
      if (res.success && res.user) {
        setUser(res.user);
        // Cập nhật lại cache local để các màn hình khác dùng nếu cần
        await SecureStore.setItemAsync('user_info', JSON.stringify(res.user));
      }
    } catch (error) {
      console.log('Lỗi lấy thông tin cá nhân:', error);
      // Nếu lỗi mạng, thử lấy từ Local Storage hiển thị tạm
      const localUser = await SecureStore.getItemAsync('user_info');
      if (localUser) setUser(JSON.parse(localUser));
    } finally {
      setLoading(false);
    }
  };

  // Tự động load lại mỗi khi vào màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đồng ý", 
          style: "destructive", 
          onPress: async () => {
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('user_info');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  // Hàm render dòng menu
  const MenuRow = ({ icon, title, value, isRed = false, onPress }: any) => (
     <TouchableOpacity style={styles.menuRow} onPress={onPress} disabled={!onPress}>
        <View style={[styles.iconBox, { backgroundColor: isRed ? '#FFF0F0' : '#F0F8FF' }]}>
           <Ionicons name={icon} size={20} color={isRed ? '#FF4D4F' : '#0056b3'} />
        </View>
        <View style={{flex: 1}}>
           <Text style={[styles.menuText, isRed && { color: '#FF4D4F' }]}>{title}</Text>
           {value && <Text style={styles.menuSubText}>{value}</Text>}
        </View>
        {!isRed && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
     </TouchableOpacity>
  );

  // Ảnh mặc định nếu user chưa có avatar
  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* HEADER GRADIENT */}
      <LinearGradient colors={['#0056b3', '#008DDA']} style={styles.header}>
         <Text style={styles.headerTitle}>Tài khoản</Text>
         
         <View style={styles.profileBox}>
            <View style={styles.avatarContainer}>
               <Image 
                 source={{ uri: user?.avatar_url || defaultAvatar }} 
                 style={styles.avatar} 
               />
               {/* Nút sửa ảnh nhỏ (Giả lập) */}
               <View style={styles.editIcon}>
                  <Ionicons name="camera" size={14} color="#0056b3" />
               </View>
            </View>
            
            <Text style={styles.name}>{user?.display_name || 'Đang tải...'}</Text>
            
            {user?.role && (
              <View style={styles.badge}>
                 <Ionicons name="shield-checkmark" size={12} color="white" />
                 <Text style={styles.badgeText}>
                    {user.role === 'CUSTOMER' ? 'Khách hàng thân thiết' : user.role}
                 </Text>
              </View>
            )}
         </View>
      </LinearGradient>

      {/* MENU CONTAINER */}
      <ScrollView 
        style={styles.menuContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProfile} />}
      >
         <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
         <MenuRow icon="person-outline" title="Họ và tên" value={user?.display_name} />
         <MenuRow icon="mail-outline" title="Email" value={user?.primary_email} />
         <MenuRow icon="calendar-outline" title="Ngày tham gia" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '---'} />
         
         <Text style={styles.sectionTitle}>Cài đặt & Bảo mật</Text>
         <MenuRow icon="lock-closed-outline" title="Đổi mật khẩu" onPress={() => Alert.alert("Thông báo", "Tính năng đang phát triển")} />
         <MenuRow icon="notifications-outline" title="Cài đặt thông báo" onPress={() => {}} />
         {/* ... */}
            <MenuRow 
            icon="chatbox-ellipses-outline" 
            title="Gửi phản hồi / Hỗ trợ" 
            onPress={() => navigation.navigate('Feedback')} 
            />
            {/* ... */}
         <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
         
         <MenuRow 
            icon="log-out-outline" 
            title="Đăng xuất" 
            isRed 
            onPress={handleLogout} 
         />
         
         <Text style={styles.versionText}>Phiên bản 1.0.0 - Metro Connect</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { height: 280, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  
  profileBox: { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: '#fff' },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', padding: 6, borderRadius: 15, elevation: 2 },
  
  name: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  badge: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, alignItems: 'center', marginTop: 5 },
  badgeText: { color: 'white', fontSize: 12, marginLeft: 5, fontWeight: '600' },

  menuContainer: { 
     flex: 1, backgroundColor: 'white', marginHorizontal: 20, marginTop: -40, 
     borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, elevation: 5, marginBottom: 20
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#999', marginBottom: 10, marginTop: 10, textTransform: 'uppercase' },
  
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { fontSize: 15, fontWeight: '600', color: '#333' },
  menuSubText: { fontSize: 13, color: '#666', marginTop: 2 },
  
  versionText: { textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: 30 }
});

export default AccountScreen;