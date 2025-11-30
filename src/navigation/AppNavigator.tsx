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
import SingleTicketSelectionScreen from '../screens/SingleTicketSelectionScreen';  // <--- IMPORT MỚI
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import TicketInfoScreen from '../screens/TicketInfoScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions= {({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: '#0056b3',
    tabBarInactiveTintColor: '#999',
    tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 10 },
    tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    tabBarIcon: ({ focused, color }) => {
      if (route.name === 'Trang chủ') {
        return <MaterialCommunityIcons name={ focused ? 'home' : 'home-outline' } size = { 28} color = { color } />;
      } else if (route.name === 'Vé của tôi') {
        return <MaterialCommunityIcons name={ focused ? 'ticket-confirmation' : 'ticket-confirmation-outline' } size = { 28} color = { color } />;
      } else if (route.name === 'Tài khoản') {
        return <Ionicons name={ focused ? 'person' : 'person-outline' } size = { 26} color = { color } />;
      }
    },
  })
}
    >
  <Tab.Screen name="Trang chủ" component = { HomeScreen } />
    <Tab.Screen name="Vé của tôi" component = { MyTicketsScreen } />
      <Tab.Screen name="Tài khoản" component = { AccountScreen } />
        </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
    <Stack.Navigator screenOptions= {{ headerShown: false }
} initialRouteName = "Login" >
  <Stack.Screen name="Login" component = { LoginScreen } />
    <Stack.Screen name="Home" component = { MainTabs } />
      <Stack.Screen name="BuyTicket" component = { BuyTicketScreen } />
        {/* 👇 THÊM MÀN HÌNH MỚI VÀO ĐÂY */ }
        < Stack.Screen name = "Feedback" component = { FeedbackScreen } />
          <Stack.Screen name="TicketInfoScreen" component = { TicketInfoScreen } />
            <Stack.Screen name="OrderConfirmation" component = { OrderConfirmationScreen } />
              <Stack.Screen name="PaymentSuccess" component = { PaymentSuccessScreen } />
                <Stack.Screen name="SingleTicketSelection" component = { SingleTicketSelectionScreen } />
                  <Stack.Screen name="Register" component = { RegisterScreen } />
                    <Stack.Screen name="ForgotPassword" component = { ForgotPasswordScreen } />
                      </Stack.Navigator>
                      </NavigationContainer>
                      </SafeAreaProvider>
  );
}