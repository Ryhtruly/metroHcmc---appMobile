import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';

const SingleTicketSelectionScreen = ({ route, navigation }: any) => {
  const { fromStation, allStations } = route.params;
  const [processingId, setProcessingId] = useState<string | null>(null);

  const destinationStations = allStations.filter((s: any) => s.code !== fromStation.code);

  const calculatePrice = (toStation: any) => {
    const stops = Math.abs(toStation.order_index - fromStation.order_index);
    const basePrice = 8000;
    const extraPrice = Math.max(0, stops - 3) * 2000;
    return basePrice + extraPrice;
  };

  const handleBuyTicket = async (toStation: any, estimatedPrice: number) => {
    navigation.navigate('OrderConfirmation', {
      ticketType: 'SINGLE',
      fromStation: fromStation,
      toStation: toStation,
      price: estimatedPrice,
      productCode: null
    });
  };

  const renderItem = ({ item }: any) => {
    const price = calculatePrice(item);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleBuyTicket(item, price)}
        disabled={processingId !== null}
      >
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={28} color="#008DDA" />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.stationName}>Đến {item.name}</Text>
          <Text style={styles.priceText}>{price.toLocaleString('vi-VN')} ₫</Text>
        </View>
        
        {processingId === item.code ? (
          <ActivityIndicator size="small" color="#003eb3" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
           <Ionicons name="arrow-back" size={24} color="#003eb3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vé lượt - Đi từ ga {fromStation.name}</Text>
        <View style={{ width: 34 }} />
      </View>

      <FlatList
        data={destinationStations}
        renderItem={renderItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF8FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#003eb3', flex: 1, textAlign: 'center' },
  
  card: {
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0',
    shadowColor: '#000', shadowOpacity: 0.02, elevation: 1
  },
  iconBox: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#E6F7FF', justifyContent: 'center', alignItems: 'center' },
  stationName: { fontSize: 16, fontWeight: '600', color: '#003eb3' },
  priceText: { fontSize: 14, color: '#666', marginTop: 4 }
});

export default SingleTicketSelectionScreen;