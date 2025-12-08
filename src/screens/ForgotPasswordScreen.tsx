import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';

const ForgotPasswordScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // kết quả từ API: mật khẩu tạm + token
    const [result, setResult] = useState<null | {
        email: string;
        temp_password: string;
        token?: string;
        message?: string;
    }>(null);

    const handleSubmit = async () => {
        const trimmed = email.trim();

        if (!trimmed) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(trimmed)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        try {
            setLoading(true);
            setResult(null);

            const res: any = await axiosClient.post('/auth/forgot-password', {
                email: trimmed,
            });

            if (res.success) {
                // lưu kết quả để hiển thị
                setResult({
                    email: res.email,
                    temp_password: res.temp_password,
                    token: res.token,
                    message: res.message,
                });

                // Có thể chỉ Alert nhẹ, thông tin chi tiết hiển thị ngay trên màn hình
                Alert.alert('Thành công', 'Đã cấp mật khẩu tạm. Xem bên dưới.');
            } else {
                Alert.alert('Lỗi', res.message || 'Không thể xử lý yêu cầu');
            }
        } catch (error: any) {
            console.log('Lỗi quên mật khẩu:', error?.response || error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <LinearGradient colors={['#0056b3', '#008DDA']} style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}
                        >
                            <Ionicons name="arrow-back" size={22} color="#fff" />
                        </TouchableOpacity>

                        <Text style={styles.title}>Quên mật khẩu</Text>
                        <Text style={styles.subtitle}>
                            Nhập email, hệ thống sẽ cấp mật khẩu tạm để bạn đăng nhập lại
                        </Text>
                    </View>

                    {/* Card form */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="mail-outline"
                                size={18}
                                color="#64748b"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                placeholder="Nhập email đã đăng ký"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Lấy mật khẩu tạm</Text>
                            )}
                        </TouchableOpacity>

                        {/* Nếu có kết quả, hiển thị cho user */}
                        {result && (
                            <View style={styles.resultCard}>
                                <Text style={styles.resultTitle}>Thông tin khôi phục</Text>

                                {result.message && (
                                    <Text style={styles.resultMessage}>{result.message}</Text>
                                )}

                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Email:</Text>
                                    <Text style={styles.resultValue}>{result.email}</Text>
                                </View>

                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Mật khẩu tạm:</Text>
                                    <Text style={[styles.resultValue, { fontWeight: '700' }]} selectable={true} >
                                        {result.temp_password}
                                    </Text>
                                </View>

                                {/* Token chỉ để debug / dev, có thể ẩn nếu không cần */}
                                {result.token && (
                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>Token:</Text>
                                        <Text
                                            style={[styles.resultValue, { fontSize: 11 }]}
                                            numberOfLines={2}
                                        >
                                            {result.token}
                                        </Text>
                                    </View>
                                )}

                                <Text style={styles.resultNote}>
                                    Hãy dùng email và mật khẩu tạm này để đăng nhập, sau đó đổi lại mật khẩu trong phần cài đặt.
                                </Text>

                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={handleBackToLogin}
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        Quay lại màn đăng nhập
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 70,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    backBtn: {
        marginBottom: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    label: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 10,
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 10,
    },
    inputIcon: {
        marginRight: 6,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 14,
        color: '#0f172a',
    },
    primaryButton: {
        marginTop: 18,
        backgroundColor: '#0056b3',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    resultCard: {
        marginTop: 18,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
        color: '#0f172a',
    },
    resultMessage: {
        fontSize: 13,
        color: '#4b5563',
        marginBottom: 8,
    },
    resultRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    resultLabel: {
        fontSize: 13,
        color: '#6b7280',
        width: 100,
    },
    resultValue: {
        fontSize: 13,
        color: '#0f172a',
        flex: 1,
    },
    resultNote: {
        marginTop: 8,
        fontSize: 12,
        color: '#6b7280',
    },
    secondaryButton: {
        marginTop: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0056b3',
        paddingVertical: 8,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#0056b3',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;
