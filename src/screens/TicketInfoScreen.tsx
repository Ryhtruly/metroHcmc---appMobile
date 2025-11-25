import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const TicketInfoScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnnounce, setSelectedAnnounce] = useState<any>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách thông báo (giống Home)
        const res: any = await axiosClient.get('/auth/announcements');
        if (res.announcements) {
          setNotifications(res.announcements);
        }
      } catch (error) {
        console.log('Lỗi tải thông báo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleOpenDetail = (item: any) => {
    setSelectedAnnounce(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => handleOpenDetail(item)}>
      {/* Icon bên trái */}
      <View style={styles.iconBox}>
        <MaterialCommunityIcons 
           name={item.title.toLowerCase().includes('khuyến mãi') ? "gift-outline" : "bell-outline"} 
           size={24} color="#0056b3" 
        />
      </View>
      
      {/* Nội dung tóm tắt */}
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDate}>{dayjs(item.created_at).format('DD/MM/YYYY HH:mm')}</Text>
      </View>

      {/* Mũi tên */}
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#003eb3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Danh sách thông báo */}
      {loading ? (
        <ActivityIndicator size="large" color="#003eb3" style={{ marginTop: 50 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
           <MaterialCommunityIcons name="bell-sleep-outline" size={60} color="#ddd" />
           <Text style={{color: '#999', marginTop: 10}}>Chưa có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.ann_id.toString()}
          contentContainerStyle={{ padding: 15 }}
        />
      )}

      {/* --- MODAL CHI TIẾT (Copy từ Home qua) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Nội dung chi tiết</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#999" />
              </TouchableOpacity>
            </View>

            {selectedAnnounce && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedAnnounce.title}</Text>
                
                <View style={styles.dateRow}>
                   <Ionicons name="time-outline" size={14} color="#666" />
                   <Text style={styles.modalDate}>
                     {dayjs(selectedAnnounce.created_at).format('DD/MM/YYYY HH:mm')}
                   </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.modalContent}>
                  {selectedAnnounce.content_md}
                </Text>
                <View style={{height: 40}} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#003eb3' },

  card: {
    flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, elevation: 1
  },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6F7FF', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#888' },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: 'white', borderRadius: 20, height: '70%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 },
  modalHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  
  modalBody: { marginTop: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#003eb3', marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  modalDate: { fontSize: 13, color: '#666', marginLeft: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  modalContent: { fontSize: 15, lineHeight: 24, color: '#333', textAlign: 'justify' }
});

export default TicketInfoScreen;