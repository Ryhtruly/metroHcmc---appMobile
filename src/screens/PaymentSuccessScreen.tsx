import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PaymentSuccessScreen = ({ route, navigation }: any) => {
  const { ticketType, fromStation, toStation, price, time } = route.params;
  const [modalVisible, setModalVisible] = useState(true); 

  const handleGoHome = () => {
    setModalVisible(false);
    navigation.navigate('Home');
  };

  const handleViewTicket = () => {
    setModalVisible(false);
    // 👇 SỬA DÒNG NÀY: Điều hướng vào Tab 'Vé của tôi' nằm trong 'Home'
    navigation.navigate('Home', { screen: 'Vé của tôi' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background mờ */}
      <View style={styles.dummyContent}>
         <Text style={styles.title}>Thông tin thanh toán</Text>
         <View style={styles.row}><Text>Thời gian:</Text><Text>{time}</Text></View>
         <View style={styles.row}><Text>Sản phẩm:</Text><Text>{ticketType === 'SINGLE' ? 'Vé lượt' : 'Vé gói'}</Text></View>
         <View style={styles.row}><Text>Tổng tiền:</Text><Text>{price.toLocaleString()}đ</Text></View>
      </View>

      {/* MODAL POPUP THÀNH CÔNG */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
             <View style={styles.iconCircle}>
                <Ionicons name="checkmark" size={40} color="#00C853" />
             </View>

             <Text style={styles.successTitle}>Thanh toán thành công</Text>
             
             <View style={styles.btnRow}>
                <TouchableOpacity style={styles.btnOutline} onPress={handleGoHome}>
                   <Text style={{color: '#00235B', fontWeight: 'bold'}}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnFill} onPress={handleViewTicket}>
                   <Text style={{color: 'white', fontWeight: 'bold'}}>Vé của tôi</Text>
                </TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>

      {!modalVisible && (
        <View style={styles.footer}>
           <TouchableOpacity style={styles.rebuyBtn} onPress={() => navigation.goBack()}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Mua lại</Text>
           </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  dummyContent: { padding: 20, opacity: 0.3 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center' },
  
  iconCircle: { 
    width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#B9F6CA', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15 
  },
  successTitle: { fontSize: 18, fontWeight: 'bold', color: '#00C853', marginBottom: 25 },

  btnRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btnOutline: { flex: 1, padding: 12, borderRadius: 25, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginRight: 10 },
  btnFill: { flex: 1, padding: 12, borderRadius: 25, backgroundColor: '#1DE9B6', alignItems: 'center', marginLeft: 10 },

  footer: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  rebuyBtn: { backgroundColor: '#00235B', padding: 15, borderRadius: 25, alignItems: 'center' }
});

export default PaymentSuccessScreen;