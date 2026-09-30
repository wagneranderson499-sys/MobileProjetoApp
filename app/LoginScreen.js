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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../Services/api';
import { useRouter } from 'expo-router';
// 1. Import do AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados do Modal "Esqueci a Senha"
  const [modalVisible, setModalVisible] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [loadingRecuperacao, setLoadingRecuperacao] = useState(false);

  const router = useRouter();

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/login', {
        email: email.trim(),
        senha: senha,
      });

      const usuarioLogado = response.data;

      // 2. ✅ SALVA O USUÁRIO NO ASYNCSTORAGE
      // Isso permite ao TransactionContext carregar apenas as receitas/despesas deste usuário especificamente!
      await AsyncStorage.setItem('@usuario_logado', JSON.stringify(usuarioLogado));

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
          'Não foi possível conectar ao servidor em http://172.20.10.2:8080. Verifique se o backend está rodando e se o celular está no mesmo Wi-Fi.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // Função para enviar o e-mail de redefinição de senha
  async function handleEsqueciSenha() {
    if (!emailRecuperacao.trim()) {
      Alert.alert('Atenção', 'Informe o seu e-mail para recuperar a senha.');
      return;
    }

    setLoadingRecuperacao(true);

    try {
      await api.post('/esqueci-senha', {
        email: emailRecuperacao.trim(),
      });

      Alert.alert(
        'E-mail Enviado',
        'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.'
      );
      setEmailRecuperacao('');
      setModalVisible(false);
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      Alert.alert('Erro', 'Não foi possível solicitar a recuperação. Tente novamente.');
    } finally {
      setLoadingRecuperacao(false);
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

        {/* Botão Esqueci Minha Senha */}
        <TouchableOpacity 
          style={styles.forgotPasswordButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

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

      {/* Modal de Esqueci a Senha */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Recuperar Senha</Text>
            <Text style={styles.modalSubtitle}>
              Digite o seu e-mail cadastrado para receber o link de redefinição.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Seu e-mail"
              placeholderTextColor="#64748B"
              value={emailRecuperacao}
              onChangeText={setEmailRecuperacao}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleEsqueciSenha} 
              disabled={loadingRecuperacao}
            >
              {loadingRecuperacao ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Enviar E-mail</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { color: '#38BDF8', fontSize: 14 },
  button: { backgroundColor: '#10B981', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#38BDF8', fontSize: 14 },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});