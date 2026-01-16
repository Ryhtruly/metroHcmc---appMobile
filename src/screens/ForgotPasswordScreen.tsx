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

    const handleSubmit = async () => {
        const trimmed = email.trim();

        // 1. Validate đầu vào
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

            // 2. Gọi API yêu cầu cấp OTP
            const res: any = await axiosClient.post('/auth/forgot-password', {
                email: trimmed,
            });

            if (res.success) {
                // 3. THÀNH CÔNG: Hiển thị OTP (giả lập) và chuyển màn hình
                // Trong thực tế, OTP sẽ gửi về email, ở đây server trả về để test
                const otpCode = res.reset_token;

                Alert.alert(
                    'Đã gửi mã xác thực',
                    `Mã OTP đã được gửi đến email ${trimmed}.\n(Mã test của bạn là: ${otpCode})`,
                    [
                        {
                            text: 'Nhập mã ngay',
                            onPress: () => {
                                // Chuyển sang màn hình ResetPassword, truyền theo email và token giả lập
                                navigation.navigate('ResetPassword', {
                                    email: trimmed,
                                    simulatedToken: otpCode
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Lỗi', res.message || 'Email không tồn tại trong hệ thống');
            }
        } catch (error: any) {
            console.log('Lỗi quên mật khẩu:', error?.response || error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau';
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
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
                            Nhập email để nhận mã xác thực (OTP) đặt lại mật khẩu.
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
                                <Text style={styles.primaryButtonText}>Lấy mã xác thực (OTP)</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.secondaryButtonText}>Quay lại đăng nhập</Text>
                        </TouchableOpacity>
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
        padding: 20,
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
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        color: '#0f172a',
    },
    primaryButton: {
        marginTop: 20,
        backgroundColor: '#0056b3',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        height: 50,
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButton: {
        marginTop: 15,
        alignItems: 'center',
        paddingVertical: 10,
    },
    secondaryButtonText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;