import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import các màn hình
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import AccountScreen from '../screens/AccountScreen';
import BuyTicketScreen from '../screens/BuyTicketScreen';
import SingleTicketSelectionScreen from '../screens/SingleTicketSelectionScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import TicketInfoScreen from '../screens/TicketInfoScreen';
import MetroMapScreen from '../screens/MetroMapScreen';
import RedeemScreen from '../screens/RedeemScreen'; 
import FaceLoginScreen from '../screens/FaceLoginScreen';
import FaceRegisterScreen from '../screens/FaceRegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0056b3',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { height: 85, paddingBottom: 10, paddingTop: 10 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Trang chủ') {
            return <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={28} color={color} />;
          } else if (route.name === 'Vé của tôi') {
            return <MaterialCommunityIcons name={focused ? 'ticket-confirmation' : 'ticket-confirmation-outline'} size={28} color={color} />;
          } else if (route.name === 'Tài khoản') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={26} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={HomeScreen} />
      <Tab.Screen name="Vé của tôi" component={MyTicketsScreen} />
      <Tab.Screen name="Tài khoản" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          {/* Màn hình Auth (Anh Tình) */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          {/* Màn hình Chính */}
          <Stack.Screen name="Home" component={MainTabs} />
          
          {/* Màn hình Chức năng (Chung) */}
          <Stack.Screen name="BuyTicket" component={BuyTicketScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
          <Stack.Screen name="TicketInfoScreen" component={TicketInfoScreen} />
          <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="SingleTicketSelection" component={SingleTicketSelectionScreen} />
          
          {/* Màn hình Chức năng (Của Bạn) */}
          <Stack.Screen name="MetroMap" component={MetroMapScreen} />
          <Stack.Screen name="FaceLogin" component={FaceLoginScreen} />
          <Stack.Screen name="FaceRegister" component={FaceRegisterScreen} />
          <Stack.Screen 
            name="Redeem" 
            component={RedeemScreen} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}