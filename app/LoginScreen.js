import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../Services/api';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
    
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('api/usuarios/login', {
        email: email.trim(),
        senha: senha,
      });
console.log(response)
      const usuarioLogado = response.data;
      
    Alert.alert(
  'Sucesso!',
  `Bem-vindo(a), ${usuarioLogado.nome || 'de volta'}!`,
  [
    {
      text: 'OK',
      onPress: () =>
        router.push({
          pathname: '/DashboardScreen',
          params: { usuario: JSON.stringify(usuarioLogado) },
        }),
    },
  ]
);
    } catch (error) {
      console.error('Erro de Login:', error);
      
      if (error.response?.status === 401 || error.response?.status === 404) {
        Alert.alert('Erro no Login', 'E-mail ou senha incorretos.');
      } else {
        Alert.alert(
          'Erro de Conexão', 
          'Não foi possível conectar ao servidor em http://192.168.18.91:8080. Verifique se o backend está rodando e se o celular está no mesmo Wi-Fi.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Botão Voltar para a Home */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/HomeScreen')}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#94A3B8" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>FinanceControl</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#64748B"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.link} 
          onPress={() => router.push('/CadastroScreen')}
        >
          <Text style={styles.linkText}>Ainda não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#162D50' },
  scroll: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 32, textAlign: 'center' },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 14, color: '#FFF', marginBottom: 16 },
  button: { backgroundColor: '#10B981', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#38BDF8', fontSize: 14 },
});