import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, StatusBar 
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axiosClient from '../api/axiosClient';

const MetroMapScreen = () => {
  const navigation = useNavigation();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tọa độ trung tâm TP.HCM 
  const INITIAL_REGION = {
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.08, 
    longitudeDelta: 0.08,
  };

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách ga
        const res: any = await axiosClient.get('/tickets/lines/L1/stations');
        
        if (res.data?.stations) {
          setStations(res.data.stations);
        }
      } catch (error) {
        console.error('Lỗi tải bản đồ:', error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu bản đồ.");
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Lọc ra các ga có tọa độ để vẽ đường nối
  const routeCoordinates = stations
    .filter(s => s.lat && s.lon)
    .map(s => ({ latitude: s.lat, longitude: s.lon }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* --- 1. HEADER (Nổi trên Map) --- */}
      <SafeAreaView style={styles.headerWrapper} edges={['top']}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#00235B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Bản đồ Tuyến Metro số 1</Text>
            <Text style={styles.headerSub}>Bến Thành - Suối Tiên</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* --- 2. BẢN ĐỒ --- */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003eb3" />
          <Text style={{marginTop: 10, color: '#666'}}>Đang tải dữ liệu bản đồ...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
          showsUserLocation={true} 
          showsCompass={true}
        >
          {/* Vẽ đường nối các ga */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#003eb3" 
            strokeWidth={6}
            lineDashPattern={[1]}
          />

          {/* Vẽ các điểm Ga (Marker) */}
          {stations.map((station) => (
            station.lat && station.lon ? (
              <Marker
                key={station.code}
                coordinate={{ latitude: station.lat, longitude: station.lon }}
                title={station.name}
                description={`Ga số ${station.order_index}`}
              >
                {/* Custom Marker View */}
                <View style={styles.markerContainer}>
                  <View style={[styles.markerDot, station.order_index === 1 || station.order_index === stations.length ? styles.endPoint : {}]} />
                  <View style={styles.markerLabel}>
                    <Text style={styles.markerText}>{station.name}</Text>
                  </View>
                </View>
              </Marker>
            ) : null
          ))}
        </MapView>
      )}
      
      {/* --- 3. CHÚ THÍCH (Footer nổi) --- */}
      <View style={styles.footerLegend}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 15}}>
           <View style={[styles.legendDot, {backgroundColor: '#003eb3'}]} />
           <Text style={styles.legendText}>Đường ray</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <View style={[styles.legendDot, {backgroundColor: '#ff4d4f', borderWidth: 2, borderColor: 'white'}]} />
           <Text style={styles.legendText}>Nhà ga</Text>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header Styles
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  backBtn: {
    padding: 5,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00235B',
  },
  headerSub: {
    fontSize: 12,
    color: '#666',
  },

  // Marker Styles
  markerContainer: {
    alignItems: 'center',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#ff4d4f', 
    marginBottom: 2,
  },
  endPoint: {
    borderColor: '#ff4d4f', 
    width: 16,
    height: 16,
    borderRadius: 8
  },
  markerLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2
  },
  markerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },

  // Footer Legend
  footerLegend: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 4,
  },
  legendDot: {
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginRight: 6
  },
  legendText: {
    fontSize: 12, 
    fontWeight: '600', 
    color: '#555'
  }
});

export default MetroMapScreen;