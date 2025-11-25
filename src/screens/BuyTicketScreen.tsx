import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axiosClient from '../api/axiosClient';

const BuyTicketScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dữ liệu từ API
  const [stations, setStations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // 1. Lấy thông tin User
        const jsonValue = await SecureStore.getItemAsync('user_info');
        if (jsonValue) setUser(JSON.parse(jsonValue));

        // 2. Lấy danh sách Ga (Cho phần Vé lượt)
        try {
          const resStations: any = await axiosClient.get('/tickets/lines/L1/stations');
          if (resStations.data?.stations) setStations(resStations.data.stations);
        } catch (err) {
          console.log("Lỗi tải ga:", err);
        }

        // 3. Lấy danh sách Vé Gói từ Web Service
        try {
          const resProducts: any = await axiosClient.get('/tickets/products');
          if (resProducts.data && resProducts.data.products) {
             setProducts(resProducts.data.products);
          }
        } catch (err) {
          console.error("Lỗi gọi API lấy vé gói:", err);
        }

      } catch (error) {
        console.log("Lỗi chung:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // --- XỬ LÝ KHI BẤM "Đi từ ga X" (Vé Lượt) ---
  const handleStationPress = (station: any) => {
    // Chuyển sang màn hình chọn ga đến
    navigation.navigate('SingleTicketSelection', {
      fromStation: station,
      allStations: stations
    });
  };

  // --- MUA VÉ GÓI ---
  const handleBuyPass = async (productCode: string) => {
    // Tìm thông tin gói vé để truyền sang màn hình sau
    const selectedProduct = products.find(p => p.code === productCode);
    if (!selectedProduct) return;

    // Chuyển sang màn hình xác nhận thanh toán
    navigation.navigate('OrderConfirmation', {
      ticketType: 'PASS',
      productCode: productCode,
      productName: selectedProduct.name_vi,     // Truyền tên tiếng Việt
      duration: selectedProduct.duration_hours, // Truyền thời hạn (giờ)
      price: Number(selectedProduct.price),
      fromStation: null,
      toStation: null
    });
  };

  const formatPrice = (price: any) => parseInt(price).toLocaleString('vi-VN');

  // Hàm format thời gian hiển thị trên badge (VD: 24h -> 1D)
  const formatDurationBadge = (hours: number) => {
    if (hours >= 720) return '30D'; // Vé tháng
    if (hours >= 24) return Math.floor(hours / 24) + 'D';
    return hours + 'H';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAF8FF" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
           <TouchableOpacity onPress={() => navigation.goBack()}>
             <Ionicons name="home-outline" size={24} color="#003eb3" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Mua vé</Text>
           <View style={{width: 24}} />
        </View>

        <View style={styles.greetingCard}>
           <View style={styles.emojiCircle}>
             <Text style={{fontSize: 24}}>🎉</Text>
           </View>
           <View style={{marginLeft: 12, flex: 1}}>
             <Text style={styles.greetingTitle}>Chào mừng, {user ? user.display_name : 'Bạn'}!</Text>
             <Text style={styles.greetingSub}>Bắt đầu các trải nghiệm mới cùng Metro nhé!</Text>
           </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {loading ? (
           <ActivityIndicator size="large" color="#003eb3" style={{marginTop: 50}} />
        ) : (
          <>
            {/* --- DANH SÁCH VÉ GÓI TỪ DATABASE --- */}
            <View style={styles.section}>
               <Text style={styles.sectionHeader}>🔥 Nổi bật 🔥</Text>
               
               {products.length === 0 ? (
                 <Text style={{textAlign:'center', color:'#999', padding: 20}}>
                   Chưa có vé gói nào được mở bán.
                 </Text>
               ) : (
                 products.map((item) => (
                   <TouchableOpacity 
                      key={item.code} 
                      style={styles.productCard}
                      onPress={() => handleBuyPass(item.code)}
                      disabled={processing}
                   >
                      <View style={styles.productIcon}>
                         <MaterialCommunityIcons name="ticket-percent-outline" size={28} color="#008DDA" />
                         <View style={styles.badgeIcon}>
                            <Text style={styles.badgeText}>
                              {formatDurationBadge(item.duration_hours)}
                            </Text>
                         </View>
                      </View>
                      <View style={{marginLeft: 15, flex: 1}}>
                         <Text style={styles.productName}>{item.name_vi}</Text>
                         <Text style={styles.productPrice}>{formatPrice(item.price)} ₫</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#ccc" />
                   </TouchableOpacity>
                 ))
               )}
            </View>

            {/* --- DANH SÁCH GA (MUA VÉ LƯỢT) --- */}
            <View style={[styles.section, {marginTop: 10}]}>
               {stations.map((st) => (
                 <TouchableOpacity 
                    key={st.code} 
                    style={styles.stationRow}
                    onPress={() => handleStationPress(st)}
                 >
                    <Text style={styles.stationText}>Đi từ ga {st.name}</Text>
                    <Text style={styles.viewDetail}>Xem chi tiết</Text>
                 </TouchableOpacity>
               ))}
            </View>

            {/* Footer Promo (Lấy gói vé đầu tiên làm promo nếu có) */}
            {products.length > 0 && (
              <View style={styles.section}>
                 <Text style={styles.sectionHeader}>🔥 Đừng quên mua vé dài hạn 🔥</Text>
                 <TouchableOpacity style={styles.productCard} onPress={() => handleBuyPass(products[0].code)}>
                    <View style={styles.productIcon}><MaterialCommunityIcons name="card-account-details-outline" size={28} color="#008DDA" /></View>
                    <View style={{marginLeft: 15, flex:1}}>
                       <Text style={styles.productName}>{products[0].name_vi}</Text>
                       <Text style={styles.productPrice}>{formatPrice(products[0].price)} ₫</Text>
                    </View>
                 </TouchableOpacity>
              </View>
            )}
            
            <Text style={styles.noteText}>
              *Hành khách là người cao tuổi, trẻ em dưới 6 tuổi, người có công với cách mạng, người tàn tật yếu thế có thể sử dụng căn cước gắn chip để đi tàu miễn phí.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF8FF' },
  
  headerContainer: { padding: 15, paddingBottom: 5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#003eb3' },

  greetingCard: {
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 25, padding: 15,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2, marginBottom: 10
  },
  emojiCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF7E6', justifyContent: 'center', alignItems: 'center' },
  greetingTitle: { fontSize: 15, fontWeight: 'bold', color: '#003eb3' },
  greetingSub: { fontSize: 12, color: '#666', marginTop: 2 },

  section: { paddingHorizontal: 15, marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 10 },

  productCard: {
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0',
    shadowColor: '#000', shadowOpacity: 0.02, elevation: 1
  },
  productIcon: { 
    width: 50, height: 50, borderRadius: 10, backgroundColor: '#E6F7FF', 
    justifyContent: 'center', alignItems: 'center', position: 'relative' 
  },
  badgeIcon: { 
    position: 'absolute', bottom: -5, right: -5, backgroundColor: 'white', 
    borderWidth: 1, borderColor: '#008DDA', borderRadius: 8, width: 24, height: 16, 
    justifyContent: 'center', alignItems: 'center' 
  },
  badgeText: { fontSize: 8, fontWeight: 'bold', color: '#008DDA' },
  productName: { fontSize: 16, fontWeight: '600', color: '#003eb3' },
  productPrice: { fontSize: 15, color: '#666', marginTop: 4 },

  stationRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 1, borderColor: '#EEE'
  },
  stationText: { fontSize: 16, fontWeight: '600', color: '#003eb3' },
  viewDetail: { fontSize: 14, color: '#003eb3', textDecorationLine: 'underline' },

  noteText: { fontSize: 12, color: '#FF9800', paddingHorizontal: 15, marginBottom: 30, fontStyle: 'italic', lineHeight: 18 },
});

export default BuyTicketScreen;