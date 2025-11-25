import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

const MyTicketsScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [detailTab, setDetailTab] = useState<'QR' | 'INFO'>('QR');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res: any = await axiosClient.get('/tickets/my-tickets');
      if (res.data?.tickets) {
        const all = res.data.tickets;
        const filtered = all.filter((t: any) => {
          if (activeTab === 0) return t.status === 'ACTIVE' || t.status === 'NEW';
          return t.status === 'USED' || t.status === 'EXPIRED';
        });
        setTickets(filtered);
      }
    } catch (error) {
      console.log('Lỗi lấy vé:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [activeTab])
  );

  const handlePressTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setDetailTab('QR');
  };

  const renderTicket = ({ item }: any) => {
    const isPass = item.type !== 'single_ride';
    const isNew = item.status === 'NEW';
    
    let statusText = '';
    if (isNew) {
      statusText = isPass ? 'Chạm để kích hoạt' : 'Chưa sử dụng';
    } else {
      statusText = isPass 
        ? `Hết hạn: ${dayjs(item.valid_to).format('DD/MM/YYYY')}` 
        : `Ngày mua: ${dayjs(item.created_at).format('DD/MM/YYYY')}`;
    }

    return (
      <TouchableOpacity style={styles.ticketCard} onPress={() => handlePressTicket(item)} activeOpacity={0.7}>
        <View style={styles.ticketIconBox}>
           <MaterialCommunityIcons 
             name={isPass ? "card-account-details-outline" : "ticket-confirmation-outline"} 
             size={30} color="#0056b3" 
           />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
           <Text style={styles.ticketName}>{item.product_name}</Text>
           <Text style={{ fontSize: 12, color: isNew ? '#00C853' : '#666', fontWeight: isNew?'bold':'normal' }}>
             {statusText}
           </Text>
        </View>
        <View style={styles.statusPill}>
           <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderModalContent = () => {
    if (!selectedTicket) return null;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedTicket.qr_code || 'TEST'}`;
    const formatFullDate = (d: string) => d ? dayjs(d).format('HH:mm - DD/MM/YYYY') : '---';
    const isPass = selectedTicket.type !== 'single_ride';

    return (
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chi tiết vé</Text>
          <TouchableOpacity onPress={() => setSelectedTicket(null)}>
            <Ionicons name="close-circle" size={30} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalTabContainer}>
          <TouchableOpacity style={[styles.modalTab, detailTab === 'QR' && styles.modalTabActive]} onPress={() => setDetailTab('QR')}>
            <Text style={[styles.modalTabText, detailTab === 'QR' && styles.modalTabTextActive]}>Mã QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalTab, detailTab === 'INFO' && styles.modalTabActive]} onPress={() => setDetailTab('INFO')}>
            <Text style={[styles.modalTabText, detailTab === 'INFO' && styles.modalTabTextActive]}>Thông tin</Text>
          </TouchableOpacity>
        </View>

        {detailTab === 'QR' && (
          <View style={styles.qrView}>
            <View style={styles.qrBorder}>
              {/* Tăng kích thước QR lên một chút cho dễ quét */}
              <Image source={{ uri: qrUrl }} style={{ width: 220, height: 220 }} />
            </View>
            
            <Text style={styles.qrInstruction}>
              {selectedTicket.status === 'NEW' ? 'Quét mã để kích hoạt vé' : 'Đưa mã vào cổng soát vé'}
            </Text>

            {/* 👇 ĐÃ XÓA DÒNG MÃ SỐ Ở ĐÂY THEO YÊU CẦU 👇 */}

            <View style={[styles.statusBadge, {backgroundColor: selectedTicket.status === 'ACTIVE' ? '#E6F7FF' : '#FFF7E6', marginTop: 15}]}>
               <Text style={{color: selectedTicket.status === 'ACTIVE' ? '#1890FF' : '#FA8C16', fontWeight:'bold'}}>
                 {selectedTicket.status}
               </Text>
            </View>
          </View>
        )}

        {detailTab === 'INFO' && (
          <View style={styles.infoView}>
            <InfoRow label="Loại vé" value={isPass ? 'Vé trọn gói (Pass)' : 'Vé lượt (Single)'} />
            <InfoRow label="Tên vé" value={selectedTicket.product_name} />
            <InfoRow label="Giá vé" value={`${parseInt(selectedTicket.final_price).toLocaleString()} đ`} />
            <View style={styles.divider} />
            <InfoRow label="Ngày mua" value={formatFullDate(selectedTicket.created_at)} />
            {selectedTicket.valid_to ? (
               <InfoRow label="Hết hạn" value={formatFullDate(selectedTicket.valid_to)} />
            ) : (
               <InfoRow label="Hiệu lực" value={isPass ? "Tính từ lúc kích hoạt" : "Trong ngày mua"} />
            )}
            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={20} color="#0056b3" style={{marginRight: 5}}/>
              <Text style={styles.noteText}>
                {isPass 
                  ? 'Vé này cho phép đi không giới hạn số lượt trong thời gian hiệu lực.' 
                  : 'Vé chỉ có giá trị cho 01 lượt đi duy nhất.'}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const InfoRow = ({ label, value }: any) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={styles.header}>
         <Ionicons name="ticket-outline" size={24} color="#003eb3" />
         <Text style={styles.headerTitle}>Vé của tôi</Text>
         <View style={{width: 24}}/>
      </View>

      <View style={styles.tabsWrapper}>
        <View style={styles.tabContainer}>
           <TouchableOpacity style={[styles.tabBtn, activeTab === 0 && styles.activeTabBtn]} onPress={() => setActiveTab(0)}>
              <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>Đang sử dụng</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.tabBtn, activeTab === 1 && styles.activeTabBtn]} onPress={() => setActiveTab(1)}>
              <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Lịch sử</Text>
           </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{marginTop: 50}} color="#003eb3" />
      ) : tickets.length === 0 ? (
        <View style={styles.emptyState}>
           <MaterialCommunityIcons name="ticket-confirmation-outline" size={60} color="#ddd" />
           <Text style={{ color: '#999', marginTop: 10 }}>Bạn không có vé nào</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.ticket_id.toString()}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTickets} />}
        />
      )}

      <Modal visible={selectedTicket !== null} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
           {renderModalContent()}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#003eb3' },
  tabsWrapper: { backgroundColor: 'white', paddingBottom: 15, paddingHorizontal: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 25, borderWidth: 1, borderColor: '#003eb3', overflow: 'hidden' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTabBtn: { backgroundColor: '#003eb3' },
  tabText: { color: '#003eb3', fontWeight: '600' },
  activeTabText: { color: 'white' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  ticketCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, elevation: 2 },
  ticketIconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#E6F7FF', justifyContent: 'center', alignItems: 'center' },
  ticketName: { fontSize: 15, fontWeight: 'bold', color: '#00235B', marginBottom: 4 },
  statusPill: { paddingLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, minHeight: 450 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalTabContainer: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderColor: '#eee' },
  modalTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  modalTabActive: { borderBottomWidth: 3, borderColor: '#003eb3' },
  modalTabText: { fontSize: 16, color: '#999', fontWeight: '600' },
  modalTabTextActive: { color: '#003eb3' },
  qrView: { alignItems: 'center', paddingVertical: 10 },
  qrBorder: { padding: 10, borderWidth: 2, borderColor: '#003eb3', borderRadius: 15, marginBottom: 10 },
  qrInstruction: { fontSize: 14, color: '#555', marginBottom: 5, textAlign: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  infoView: { paddingVertical: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  infoLabel: { fontSize: 15, color: '#666' },
  infoValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  noteBox: { flexDirection: 'row', backgroundColor: '#F0F8FF', padding: 12, borderRadius: 10, marginTop: 10 },
  noteText: { flex: 1, fontSize: 13, color: '#0056b3', lineHeight: 18 }
});

export default MyTicketsScreen;