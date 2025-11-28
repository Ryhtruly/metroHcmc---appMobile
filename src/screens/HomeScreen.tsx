import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions, RefreshControl, Modal 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axiosClient from '../api/axiosClient';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

const HomeScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnnounce, setSelectedAnnounce] = useState<any>(null);

  const loadData = async () => {
    try {
      const jsonValue = await SecureStore.getItemAsync('user_info');
      if (jsonValue) setUser(JSON.parse(jsonValue));

      const res: any = await axiosClient.get('/auth/announcements');
      if (res.announcements) {
        setAnnouncements(res.announcements);
      }
    } catch (error) {
      console.log('Lỗi tải trang chủ:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const features = [
    { id: 1, name: 'Mua vé', icon: 'ticket-percent', lib: 'MaterialCommunityIcons' },
    { id: 2, name: 'Vé của tôi', icon: 'ticket-account', lib: 'MaterialCommunityIcons' },
    { id: 3, name: 'Đổi mã\nlấy vé', icon: 'qrcode-scan', lib: 'MaterialCommunityIcons' },
    
    // 👇 ID QUAN TRỌNG
    { id: 4, name: 'Thông tin\nvé', icon: 'information-outline', lib: 'MaterialCommunityIcons' }, 
    
    { id: 5, name: 'Hành trình', icon: 'map-marker-path', lib: 'MaterialCommunityIcons' },
    { id: 6, name: 'Mua vé\nSuối Tiên', icon: 'ferry', lib: 'MaterialCommunityIcons' },
    { id: 7, name: 'Siêu thị\nonline', icon: 'cart-outline', lib: 'MaterialCommunityIcons' },
    { id: 8, name: 'Tài khoản', icon: 'account-circle-outline', lib: 'MaterialCommunityIcons' },
  ];

  // --- HÀM ĐIỀU HƯỚNG CHUẨN (DÙNG ID) ---
  const handlePress = (id: number) => {
    if (id === 1) navigation.navigate('BuyTicket'); // Mua vé
    else if (id === 2) navigation.navigate('Home', { screen: 'Vé của tôi' });
    else if (id === 8) navigation.navigate('Home', { screen: 'Tài khoản' });
    
    // 👇 CHUYỂN TRANG THÔNG TIN VÉ
    else if (id === 4) navigation.navigate('TicketInfoScreen');
    else if (id === 5) navigation.navigate('MetroMap');
  };

  const handleOpenNews = (item: any) => {
    setSelectedAnnounce(item);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3275CA" />

      {/* HEADER */}
      <View style={styles.headerBackground}>
        <View style={styles.headerTopRow}>
           <View style={styles.langBadge}>
              <Ionicons name="globe-outline" size={16} color="white" />
              <Text style={styles.langText}>Tiếng Việt</Text>
           </View>
           {user && (
             <Text style={{color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600'}}>
               Chào, {user.display_name}
             </Text>
           )}
        </View>
      </View>

      {/* MENU GRID */}
      <View style={styles.menuCard}>
         <View style={styles.logoFloating}>
            <Text style={styles.logoText}>HURC</Text>
         </View>

         <View style={styles.gridContainer}>
            {features.map((item) => (
               <TouchableOpacity 
                  key={item.id} 
                  style={styles.gridItem}
                  onPress={() => handlePress(item.id)} // <--- QUAN TRỌNG: Truyền ID
               >
                  <View style={styles.iconCircle}>
                     {item.lib === 'MaterialCommunityIcons' && <MaterialCommunityIcons name={item.icon as any} size={28} color="#0056b3" />}
                     {item.lib === 'Ionicons' && <Ionicons name={item.icon as any} size={28} color="#0056b3" />}
                     {item.lib === 'FontAwesome5' && <FontAwesome5 name={item.icon as any} size={24} color="#0056b3" />}
                  </View>
                  <Text style={styles.gridLabel}>{item.name}</Text>
               </TouchableOpacity>
            ))}
         </View>
      </View>

      {/* DANH SÁCH THÔNG BÁO */}
      <ScrollView 
        style={styles.scrollContent} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
         <Text style={styles.sectionTitle}>Tin tức & Thông báo</Text>
         {announcements.length === 0 ? (
            <Text style={{textAlign: 'center', color: '#999', marginTop: 20}}>Không có thông báo mới</Text>
         ) : (
            announcements.map((item: any) => (
              <TouchableOpacity key={item.ann_id} style={styles.banner} onPress={() => handleOpenNews(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bannerTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.bannerDate}>{dayjs(item.created_at).format('DD/MM/YYYY')}</Text>
                    <Text style={styles.bannerDesc} numberOfLines={2}>{item.content_md}</Text>
                    <Text style={styles.bannerAction}>Xem chi tiết</Text>
                  </View>
                  <View style={styles.newsIconBox}>
                    <MaterialCommunityIcons name={item.title.toLowerCase().includes('khuyến mãi') ? "gift-outline" : "newspaper-variant-outline"} size={32} color="#0056b3" />
                  </View>
              </TouchableOpacity>
            ))
         )}
      </ScrollView>

      {/* MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Chi tiết thông báo</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#999" />
              </TouchableOpacity>
            </View>
            {selectedAnnounce && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedAnnounce.title}</Text>
                <View style={styles.dateRow}>
                   <Ionicons name="time-outline" size={14} color="#666" />
                   <Text style={styles.modalDate}>Đăng ngày: {dayjs(selectedAnnounce.created_at).format('DD/MM/YYYY HH:mm')}</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.modalContent}>{selectedAnnounce.content_md}</Text>
                <View style={{height: 40}} />
              </ScrollView>
            )}
            <View style={styles.modalFooter}>
               <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeBtnText}>Đóng</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  headerBackground: { height: 180, backgroundColor: '#3275CA', paddingTop: 50, paddingHorizontal: 20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  langBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  langText: { color: 'white', marginLeft: 5, fontWeight: '500', fontSize: 12 },
  menuCard: { backgroundColor: 'white', marginHorizontal: 15, marginTop: -80, borderRadius: 20, paddingTop: 35, paddingBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, position: 'relative' },
  logoFloating: { position: 'absolute', top: -30, alignSelf: 'center', width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#F5F7FA', elevation: 5 },
  logoText: { color: '#0056b3', fontWeight: '900', fontSize: 12 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 },
  gridItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F8FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridLabel: { fontSize: 11, color: '#555', textAlign: 'center', lineHeight: 15 },
  scrollContent: { marginTop: 15, paddingHorizontal: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  banner: { backgroundColor: 'white', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0', shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
  bannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#003eb3', marginBottom: 4 },
  bannerDate: { fontSize: 11, color: '#999', marginBottom: 6 },
  bannerDesc: { fontSize: 13, color: '#555', lineHeight: 18 },
  bannerAction: { fontSize: 12, color: '#008DDA', marginTop: 8, fontWeight: '600' },
  newsIconBox: { width: 50, height: 50, backgroundColor: '#E6F7FF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '70%', width: '100%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderColor: '#eee' },
  modalHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalBody: { marginTop: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#003eb3', marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  modalDate: { fontSize: 13, color: '#666', marginLeft: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  modalContent: { fontSize: 16, lineHeight: 24, color: '#333', textAlign: 'justify' },
  modalFooter: { paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' },
  closeBtn: { backgroundColor: '#003eb3', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default HomeScreen;