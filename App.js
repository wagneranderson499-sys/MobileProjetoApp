import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import das telas de autenticação e apresentação
import HomeScreen from './Screens/HomeScreen';
import CadastroScreen from './Screens/CadastroScreen';
import LoginScreen from './Screens/LoginScreen';

// Import das telas internas do aplicativo (com Bottom Tabs)
import DashboardScreen from './Screens/DashboardScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Componente que gerencia o Menu Inferior (Bottom Tabs)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#10B981', // Verde esmeralda para o ícone ativo
        tabBarInactiveTintColor: '#64748B', // Cinza para o inativo
        tabBarStyle: {
          backgroundColor: '#162D50', // Azul marinho do tema
          borderTopColor: '#1E3A8A',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Histórico') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Relatórios') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Configurações') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={DashboardScreen} />
      <Tab.Screen name="Histórico" component={HistoricoScreen} />
      <Tab.Screen name="Relatórios" component={RelatoriosScreen} />
      <Tab.Screen name="Configurações" component={ConfiguraçõesScreen} />
    </Tab.Navigator>
  );
}

// Navegação Raiz (Stack principal)
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#162D50" />

      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Fluxo Externo (Apresentação e Auth) */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Fluxo Interno (App Principal com Menu Inferior) */}
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}