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

const RegisterScreen = ({ navigation }: any) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!displayName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return false;
        }
        // check email đơn giản
        if (!/\S+@\S+\.\S+/.test(email.trim())) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return false;
        }
        if (!password) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Nhập lại mật khẩu không khớp');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            const res: any = await axiosClient.post('/auth/register', {
                email: email.trim(),
                password,
                displayName: displayName.trim(),
            });

            if (res.success) {
                Alert.alert(
                    'Thành công',
                    'Đăng ký thành công, vui lòng đăng nhập',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(), // quay lại màn Login
                        },
                    ],
                );
            } else {
                Alert.alert('Lỗi', res.message || 'Không thể đăng ký tài khoản');
            }
        } catch (error: any) {
            console.log('Lỗi đăng ký:', error?.response || error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng ký tài khoản');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#0056b3', '#008DDA']}
            style={{ flex: 1 }}
        >
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

                        <Text style={styles.title}>Tạo tài khoản mới</Text>
                        <Text style={styles.subtitle}>
                            Đăng ký để sử dụng Metro Connect
                        </Text>
                    </View>

                    {/* Form white card */}
                    <View style={styles.card}>
                        {/* Họ và tên */}
                        <Text style={styles.label}>Họ và tên</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="person-outline"
                                size={18}
                                color="#64748b"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                placeholder="Nhập họ và tên"
                                value={displayName}
                                onChangeText={setDisplayName}
                                style={styles.input}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        {/* Email */}
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="mail-outline"
                                size={18}
                                color="#64748b"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                placeholder="Nhập email"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Mật khẩu */}
                        <Text style={styles.label}>Mật khẩu</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color="#64748b"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                placeholder="Ít nhất 6 ký tự"
                                value={password}
                                onChangeText={setPassword}
                                style={styles.input}
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                            />
                        </View>

                        {/* Nhập lại mật khẩu */}
                        <Text style={styles.label}>Nhập lại mật khẩu</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color="#64748b"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                style={styles.input}
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                            />
                        </View>

                        {/* Nút Đăng ký */}
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Đăng ký</Text>
                            )}
                        </TouchableOpacity>

                        {/* Link chuyển sang Đăng nhập */}
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Đã có tài khoản?</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.footerLink}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
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
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 14,
    },
    footerText: {
        fontSize: 13,
        color: '#6b7280',
    },
    footerLink: {
        fontSize: 13,
        color: '#0056b3',
        fontWeight: '600',
        marginLeft: 4,
    },
});

export default RegisterScreen;
