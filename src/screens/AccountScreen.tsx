import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/axiosClient';
import DateTimePicker from '@react-native-community/datetimepicker';

const AccountScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    phone_number: '',
    address: '',
    cccd: '',
    birth_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);  // State để kiểm soát DatePicker
  // Thêm trạng thái mới để kiểm tra việc mở/đóng modal đổi mật khẩu
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  //show password
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Mở modal đổi mật khẩu
  const openPasswordModal = () => {
    setIsModalVisible(true);
  };

  // Đóng modal
  const closePasswordModal = () => {
    setIsModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ các trường');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp với xác nhận mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert('Lỗi', 'Token không tồn tại');
        return;
      }

      const response: any = await axiosClient.post('auth/reset-password', {
        token,
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (response.success) {
        Alert.alert(
          'Thành công',
          'Mật khẩu đã được thay đổi. Bạn sẽ được đăng xuất để đăng nhập lại.',
          [
            {
              text: 'Đồng ý',
              onPress: async () => {
                await SecureStore.deleteItemAsync('auth_token');
                await SecureStore.deleteItemAsync('user_info');
                navigation.replace('Login'); // chuyển về màn hình Login
              },
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Có lỗi xảy ra khi thay đổi mật khẩu');
      }
    } catch (error: any) {
      console.log('Lỗi đổi mật khẩu:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu');
    } finally {
      setLoading(false);
      closePasswordModal(); // đóng modal sau khi xử lý xong
    }
  };


  // Hàm lấy thông tin user mới nhất từ Server
  const fetchProfile = async () => {
    try {
      const res: any = await axiosClient.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        await SecureStore.setItemAsync('user_info', JSON.stringify(res.user));
      }
    } catch (error) {
      console.log('Lỗi lấy thông tin cá nhân:', error);
      const localUser = await SecureStore.getItemAsync('user_info');
      if (localUser) setUser(JSON.parse(localUser));
    }
  };

  // Hàm refresh với indicator
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, []);

  // Hàm mở modal chỉnh sửa
  const openEditModal = () => {
    if (!user) return;
    setEditForm({
      display_name: user.display_name || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      cccd: user.cccd || '',
      birth_date: user.birth_date || '',
    });
    setIsEditing(true);
  };

  // Hàm đóng modal
  const closeEditModal = () => {
    setIsEditing(false);
    setSaving(false);
  };

  // Hàm lưu thông tin
  const saveProfile = async () => {
    try {
      setSaving(true);

      // Chuẩn bị dữ liệu để gửi lên server
      const updateData: any = {
        // Gửi tất cả các trường dù có thay đổi hay không
        display_name: editForm.display_name.trim(),
        phone_number: editForm.phone_number.trim(),
        address: editForm.address.trim(),
        cccd: editForm.cccd.trim(),
        birth_date: editForm.birth_date.trim(),
      };

      // Validate dữ liệu
      if (!editForm.display_name.trim()) {
        Alert.alert('Lỗi', 'Tên hiển thị không được để trống');
        setSaving(false);
        return;
      }

      // Gửi PUT request để cập nhật thông tin
      const res: any = await axiosClient.put('/auth/me', updateData);

      if (res.success && res.user) {
        setUser(res.user); // cập nhật dữ liệu người dùng mới
        await SecureStore.setItemAsync('user_info', JSON.stringify(res.user)); // Lưu lại thông tin
        Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        closeEditModal();
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể cập nhật thông tin');
      }
    } catch (error: any) {
      console.log('Lỗi cập nhật thông tin:', error);
      if (error.response) {
        console.log('Lỗi từ server:', error.response.data);
        Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } finally {
      setSaving(false);
    }
  };

  // Format ngày sinh
  const formatDateOfBirth = (dateString: string) => {
    if (!dateString) return '---';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) {
      return '---';
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios' ? true : false);  // Để lại DatePicker nếu đang trên iOS
    setEditForm({
      ...editForm,
      birth_date: currentDate.toISOString().split('T')[0],  // Lưu giá trị ngày sinh theo định dạng YYYY-MM-DD
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
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
      <View style={{ flex: 1 }}>
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
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
          <TouchableOpacity onPress={openEditModal} style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.editProfileText}>Sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileBox}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar_url || defaultAvatar }}
              style={styles.avatar}
            />
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={14} color="#0056b3" />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name}>
              {user?.display_name || 'Đang tải...'}
            </Text>
          </View>

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0056b3" style={styles.loadingIndicator} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <MenuRow
              icon="person-outline"
              title="Họ và tên"
              value={user?.display_name}
            />
            <MenuRow
              icon="mail-outline"
              title="Email"
              value={user?.primary_email}
            />
            <MenuRow
              icon="calendar-outline"
              title="Ngày tham gia"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('vi-VN')
                  : '---'
              }
            />

            <MenuRow
              icon="phone-portrait-outline"
              title="Số điện thoại"
              value={user?.phone_number || 'Chưa cập nhật'}
            />
            <MenuRow
              icon="home-outline"
              title="Địa chỉ"
              value={user?.address || 'Chưa cập nhật'}
            />
            <MenuRow
              icon="id-card-outline"
              title="CCCD"
              value={user?.cccd || 'Chưa cập nhật'}
            />
            <MenuRow
              icon="calendar-outline"
              title="Ngày sinh"
              value={formatDateOfBirth(user?.birth_date)}
            />

            <Text style={styles.sectionTitle}>Cài đặt & Bảo mật</Text>
            <MenuRow
              icon="lock-closed-outline"
              title="Đổi mật khẩu"
              onPress={openPasswordModal} // Mở modal khi nhấn nút
            />
            <MenuRow
              icon="notifications-outline"
              title="Cài đặt thông báo"
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <MenuRow
              icon="chatbox-ellipses-outline"
              title="Gửi phản hồi / Hỗ trợ"
              onPress={() => navigation.navigate('Feedback')}
            />

            <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />

            <MenuRow
              icon="log-out-outline"
              title="Đăng xuất"
              isRed
              onPress={handleLogout}
            />

            <Text style={styles.versionText}>Phiên bản 1.0.0 - Metro Connect</Text>
          </>
        )}
      </ScrollView>
      {/* Modal đổi mật khẩu */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePasswordModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={closePasswordModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Mật khẩu cũ */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu cũ *</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Nhập mật khẩu cũ"
                  secureTextEntry={!showOldPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowOldPassword(!showOldPassword)}
                >
                  <Ionicons
                    name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Mật khẩu mới */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nhập mật khẩu mới"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Xác nhận mật khẩu */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Xác nhận mật khẩu mới"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closePasswordModal}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* MODAL CHỈNH SỬA THÔNG TIN */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và tên *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.display_name}
                  onChangeText={(text) => setEditForm({ ...editForm, display_name: text })}
                  placeholder="Nhập họ và tên"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phone_number}
                  onChangeText={(text) => setEditForm({ ...editForm, phone_number: text })}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.address}
                  onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                  placeholder="Nhập địa chỉ"
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CCCD/CMND</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.cccd}
                  onChangeText={(text) => setEditForm({ ...editForm, cccd: text })}
                  placeholder="Nhập số CCCD/CMND"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ngày sinh</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.input}>
                    {editForm.birth_date ? editForm.birth_date : 'Chọn ngày sinh'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(editForm.birth_date || Date.now())}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeEditModal}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>

  );
};

const styles = StyleSheet.create({
  header: {
    height: 280,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editProfileText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
  profileBox: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: '#fff',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 15,
    elevation: 2,
  },
  name: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 5,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  menuSubText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 12,
    marginTop: 30,
  },
  loadingIndicator: {
    marginTop: 40,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6ffed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginLeft: 55,
    marginBottom: 10,
  },
  verifiedText: {
    fontSize: 12,
    color: '#52c41a',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',

  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  inputHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#0056b3',
    marginLeft: 10,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    position: 'relative', // để icon có thể position absolute
  },

  eyeIcon: {
    position: 'absolute',
    right: 12,
  }

});

export default AccountScreen;
