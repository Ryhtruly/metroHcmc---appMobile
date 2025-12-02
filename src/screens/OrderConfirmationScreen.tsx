import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import * as Linking from 'expo-linking';

const navigateToMyTickets = (navigation: any) => {
  // Reset về màn hình gốc (Stack Home) để xóa lịch sử Back
  navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }], 
  });
  
  // Sau đó chuyển sang Tab "Vé của tôi"
  // setTimeout để đảm bảo reset xong mới navigate tiếp
  setTimeout(() => {
    navigation.navigate('Home', { screen: 'Vé của tôi' });
  }, 100);
};

const OrderConfirmationScreen = ({ route, navigation }: any) => {
  // Nhận thêm productName và duration từ màn hình trước
  const { ticketType, fromStation, toStation, price, productCode, productName, duration } = route.params;
  const [processing, setProcessing] = useState(false);

  // --- LOGIC HIỂN THỊ ---
  const isPass = ticketType === 'PASS';
  
  // 1. Tên sản phẩm
  const displayProductName = isPass 
    ? productName // Ví dụ: "Vé ngày 7 ngày"
    : `Vé lượt: ${fromStation.name} – ${toStation.name}`;

  // 2. Hạn sử dụng
  let hsdText = '';
  if (isPass) {
    const days = Math.floor(duration / 24);
    hsdText = days >= 30 ? '30 ngày kể từ khi kích hoạt' : `${days} ngày kể từ khi kích hoạt`;
  } else {
    hsdText = 'Sử dụng trong ngày mua';
  }

  // 3. Lưu ý
  const noteText = isPass 
    ? 'Đi không giới hạn số lượt trong thời hạn vé' 
    : 'Vé chỉ sử dụng cho 01 lượt đi';

    useEffect(() => {
      const handleDeepLink = (event: { url: string }) => {
        const { url } = event;
  
        // TH1: Thành công (PayOS redirect thẳng về)
        if (url.includes('payment-result') || url.includes('payment-success')) {
          setProcessing(false);
          // Chuyển hướng về trang Vé và reset stack để user không back lại màn hình này được
          Alert.alert("Thanh toán thành công", "Vé đã được thêm vào ví của bạn.", [
            { 
              text: "Xem vé", 
              onPress: () => navigateToMyTickets(navigation) // Gọi hàm điều hướng mới
            }
          ]);
        }
        
        // TH2: Hủy (Backend redirect về sau khi update DB)
        if (url.includes('payment-cancel')) {
          setProcessing(false);
          Alert.alert("Đã hủy", "Giao dịch đã bị hủy. Vé không được tạo.");
        }
      };
  
      const subscription = Linking.addEventListener('url', handleDeepLink);
  
      // Kiểm tra xem App có được mở từ link không 
      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });
  
      return () => {
        subscription.remove();
      };
    }, []);

  // --- HÀM CHUNG: TẠO VÉ TRONG DATABASE ---
  const createTicketInDatabase = async () => {
    let res: any;
    if (ticketType === 'SINGLE') {
      res = await axiosClient.post('/tickets/single', {
        line_code: 'L1',
        from_station: fromStation.code,
        to_station: toStation.code,
        stops: Math.abs(toStation.order_index - fromStation.order_index), 
        final_price: price, 
        promo_code: null
      });
    } else {
      res = await axiosClient.post('/tickets/pass', {
        product_code: productCode,
        promo_code: null
      });
    }

    // Lấy ID vé từ response (Lưu ý đúng cấu trúc data.data.ticket)
    const ticketId = res.data?.ticket?.ticket_id;
    if (!ticketId) throw new Error("Không lấy được ID vé từ hệ thống");
    
    return ticketId;
  };

  // --- CÁCH 1: THANH TOÁN PAYOS (REAL) ---
  const handlePaymentPayOS = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      // 1. Tạo vé
      const ticketId = await createTicketInDatabase();

      // 2. Tạo Deep Link
      const successLink = Linking.createURL('payment-result');
      const cancelLink  = Linking.createURL('payment-cancel');
      
      console.log("Success Link:", successLink);
      console.log("Cancel Link:", cancelLink);

      // 3. Lấy link thanh toán (Gửi kèm returnUrl)
      const payRes: any = await axiosClient.post('/payments/create', {
        ticket_id: ticketId,
        method: 'PAYOS',
        returnUrl: successLink, // Link khi thành công
        cancelUrl: cancelLink   // Link khi hủy
      });
      const { checkoutUrl } = payRes;

      // 4. Mở trình duyệt
      if (checkoutUrl) {
        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          await Linking.openURL(checkoutUrl);
        }
      }
    } catch (error: any) {
      Alert.alert("Lỗi PayOS", error.response?.data?.message || error.message || "Lỗi kết nối");
    } finally {
      setProcessing(false);
    }
  };

  // --- CÁCH 2: THANH TOÁN DEMO (TEST NHANH) ---
  const handlePaymentDemo = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      // 1. Tạo vé
      const ticketId = await createTicketInDatabase();

      // 2. Gọi API Demo (Thành công ngay)
      await axiosClient.post('/payments/create-demo', {
        ticket_id: ticketId,
        method: 'DEMO_WALLET' 
      });

      // 3. Chuyển trang thành công ngay lập tức
      navigation.replace('PaymentSuccess', { 
         ticketType, fromStation, toStation, price, time: new Date().toLocaleString() 
      });

    } catch (error: any) {
      console.error("Demo Error", error);
      Alert.alert("Lỗi Demo", error.response?.data?.message || error.message || "Không thể tạo thanh toán demo");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#00235B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin đơn hàng</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <View style={styles.card}>
           <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <MaterialCommunityIcons name="credit-card-outline" size={24} color="#0056b3" />
              <Text style={{marginLeft: 10, fontSize: 16, color: '#333'}}>Ví điện tử / Ngân hàng</Text>
           </View>
           <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>

        <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
        <View style={styles.card}>
           <View style={styles.row}>
              <Text style={styles.label}>Sản phẩm:</Text>
              <Text style={[styles.value, {fontWeight: 'bold'}]}>{displayProductName}</Text>
           </View>
           <View style={styles.row}>
              <Text style={styles.label}>Đơn giá:</Text>
              <Text style={styles.value}>{price.toLocaleString()}đ</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.row}>
              <Text style={[styles.label, {fontWeight: 'bold', color: '#000'}]}>Tổng giá tiền:</Text>
              <Text style={[styles.value, {fontWeight: 'bold', color: '#D32F2F', fontSize: 16}]}>{price.toLocaleString()}đ</Text>
           </View>
        </View>

        <Text style={styles.sectionTitle}>Thông tin vé</Text>
        <View style={styles.card}>
           <View style={styles.row}>
              <Text style={styles.label}>Loại vé:</Text>
              <Text style={styles.value}>{isPass ? 'Vé trọn gói (Pass)' : 'Vé lượt (Single)'}</Text>
           </View>
           <View style={styles.row}>
              <Text style={styles.label}>HSD:</Text>
              <Text style={styles.value}>{hsdText}</Text>
           </View>
           <View style={styles.row}>
              <Text style={styles.labelRed}>Lưu ý:</Text>
              <Text style={styles.valueRed}>{noteText}</Text>
           </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
         <Text style={styles.footerNote}>Bằng việc bấm thanh toán, bạn đồng ý với điều khoản của Metro</Text>
         <TouchableOpacity 
            style={styles.payButton} 
            onPress={handlePaymentPayOS}
            disabled={processing}
         >
            {processing ? <ActivityIndicator color="white" /> : <Text style={styles.payButtonText}>Thanh toán: {price.toLocaleString()}đ</Text>}
         </TouchableOpacity>
         <TouchableOpacity 
            style={styles.payButton} 
            onPress={handlePaymentDemo}
            disabled={processing}
         >
            {processing ? <ActivityIndicator color="white" /> : <Text style={styles.payButtonText}>Thanh toán: {price.toLocaleString()}đ (DEMO)</Text>}
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#00235B' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#00235B', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, flexDirection: 'column' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#666', flex: 1 },
  value: { color: '#00235B', fontWeight: '500', flex: 2, textAlign: 'right' },
  labelRed: { color: '#E53935', flex: 1, fontWeight: 'bold' },
  valueRed: { color: '#E53935', flex: 2, textAlign: 'right', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  footer: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  footerNote: { fontSize: 12, color: '#008DDA', textAlign: 'center', marginBottom: 10 },
  payButton: { backgroundColor: '#333', borderRadius: 25, paddingVertical: 15, alignItems: 'center', margin: 10 },
  payButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default OrderConfirmationScreen;